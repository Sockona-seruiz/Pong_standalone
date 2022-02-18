// import { SerializeOptions } from "@nestjs/common";
// import { ConfigModule } from "@nestjs/config";
import { SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
// import { match } from "assert";
// import { ColdObservable } from "rxjs/internal/testing/ColdObservable";
import { Socket, Server } from "socket.io";
// import { UpdateMatchDTO } from "src/models/match.models";
// import { Status } from "src/status.enum";

// import { UserService } from "src/user/user.service";
// import { MatchService } from './match.service';


//Creer une room DE TOUT LES USERS LOG IN pour pouvoir emit la nouvelle liste de gens à spec

var users_in_matchmaking_0 : Socket [];
var users_in_matchmaking_1 : Socket [];
var game_rooms: string [];

const users_key_status = new Map();

const users_id = new Map();
const users_name = new Map();
const socket_id = new Map();

const duels = new Map();
const duels_mode = new Map();
const duels_waiting_room = new Map();

const room_match_info = new Map();// room / match_infos =
// {
// 	player_0_nick: socket_nick.get(players[0].id),
// 	player_1_nick: socket_nick.get(players[1].id),
// 	player_0_score: 0,
// 	player_1_score: 0,
// 	player_0_socket: players[0],
// 	player_1_socket: players[1],
// 	GameStatus: launch_game,
// 	player_0_paddle_size: 0,
// 	player_1_paddle_size: 0,
// 	game_done: 0
// }

const user_in_game = new Map(); //Player Status -> socket.id / status (-1 can play, 0 || 1 is playing)
const socket_nick = new Map(); // socket.id / nickname
const nick_socket = new Map(); // nickname / socket.id

const socket_infos = new Map(); //Socket.id -> infos = {UserStatus, Nickname, room}


// room_match_info.get(socket_infos.get(nick_socket.get(config.spec)).room)
// var nicknames : string [];
users_in_matchmaking_0 = [];
users_in_matchmaking_1 = [];
game_rooms = [];

var PI_s = 
{
	M_PI : Math.PI,
	M_2PI : 2 * Math.PI,
	M_PI_2 : Math.PI / 2,
	M_3PI_2 : 3 * (Math.PI / 2)
}

@WebSocketGateway(
	{
		cors: {origin:'http://localhost:8080',
		methods: ['GET', 'POST'],
		credentials: true}
	}
)
export class PongGateway
{
	// constructor(private MatchService: MatchService,
	// 			private userService: UserService) {}

	@WebSocketServer()
	server: Server;

	afterInit(server: Server)
	{
		console.log("game socket init !");
	}

	handleConnection(client: Socket)
	{
		this.server.emit("send_user_list");

		console.log (client.id + " has join the server");
		users_key_status.set(client.id, 0);
		users_id.set(client.id, -1);
		user_in_game.set(client.id, -1);
		return;
	};

	async handleDisconnect(client: Socket)
	{
		let index_of_client_0: number;
		let index_of_client_1: number;
		let index_of_game_room: number;

		console.log (client.id + " has left the server");
		// client.leave(client.id);
		index_of_client_0 = users_in_matchmaking_0.indexOf(client);
		index_of_client_1 = users_in_matchmaking_1.indexOf(client);

		if (index_of_client_0 != -1)
		{
			users_in_matchmaking_0.splice(index_of_client_0, 1);
			console.log("users in classic matchmaking : " + users_in_matchmaking_0.length);
		}
		else if (index_of_client_1 != -1)
		{
			users_in_matchmaking_1.splice(index_of_client_1, 1);
			console.log("users in bonus matchmaking : " + users_in_matchmaking_1.length);
		}
		else if (socket_infos.get(client.id))
		// else if (room_match_info.get(socket_infos.get(client.id).room))//Le joueur était en game
		{
			let player_room = socket_infos.get(client.id).room;
			if (room_match_info.get(player_room) != null)
			{
				if (room_match_info.get(player_room).game_done != 1) //Le joeur était en game et elle était en cours
				{
					//reset user_in_game.set(client.id, -1); pour les DEUX joueurs
					user_in_game.set(room_match_info.get(player_room).player_0_socket, -1);
					user_in_game.set(room_match_info.get(player_room).player_1_socket, -1);

					room_match_info.get(player_room).game_done  = 1;//On met fin à la game
					console.log("Game socket = " + player_room);
					room_match_info.get(socket_id.get(users_id.get(client.id)));
					this.server.to(player_room).emit("User_disconected", socket_nick.get(client.id));

					console.log("A user LEFT A RUNNING MATCH");


					// console.log(room_match_info.get(socket_id.get(users_id.get(client.id)))[4]);

					// let data_picker = socket_id.get(users_id.get(client.id));
					//Remettre le deux user Online
					// await this.userService.changeStatus(room_match_info.get(data_picker)[6], Status.Online);
					// await this.userService.changeStatus(room_match_info.get(data_picker)[7], Status.Online);


					//Determine le gagnant (pas forcement utile car pas de stockage de données)
					// let win_0 = false;
					// let win_1 = false;

					// if (room_match_info.get(data_picker)[4].id == client.id)
					// 	win_1 = true;
					// else
					// 	win_0 = true;

					// room_match_info.get(data_picker).push(1);
					////////////////////////////////////////////////////////////////////////////

					// let return_tab: UpdateMatchDTO = {winner_0: win_0, points_0: room_match_info.get(data_picker)[2], userId_0: room_match_info.get(data_picker)[6],
					// 	winner_1 : win_1, points_1: room_match_info.get(data_picker)[3], userId_1: room_match_info.get(data_picker)[7], game_mode: room_match_info.get(data_picker)[8]};
					// this.MatchService.createMatch(return_tab);
				}
				index_of_game_room = game_rooms.indexOf(player_room);
				game_rooms.splice(index_of_game_room, 1);
				room_match_info.delete(player_room);
				this.get_player_list(null);
			}
		}

		duels.delete(users_id.get(client.id));
		duels_mode.delete(users_id.get(client.id));
		duels_waiting_room.delete(users_id.get(client.id));

		users_id.delete(client.id);
		users_key_status.delete(client.id);
		users_name.delete(client.id);
		user_in_game.set(client.id, -1);
		return;
	};

	@SubscribeMessage('QuitMactchmaking')
	async quit_Matchmaking(client: Socket)
	{
		client.emit("hide_loader");
		let index_of_client_0: number;
		let index_of_client_1: number;

		index_of_client_0 = users_in_matchmaking_0.indexOf(client);
		index_of_client_1 = users_in_matchmaking_1.indexOf(client);

		if (index_of_client_0 != -1)
		{
			users_in_matchmaking_0.splice(index_of_client_0, 1);
			console.log(client.id + " left classic matchmaking");
		}
		else if (index_of_client_1 != -1)
		{
			users_in_matchmaking_1.splice(index_of_client_1, 1);
			console.log(client.id + " left bonus matchmaking");
		}
		else
			console.log(client.id + " was not in matchmaking");
	};

	@SubscribeMessage('get_player_list')
	async get_player_list(client: Socket)
	{
		let i: number = 0;
		var users: string [];

		users = [];

		while (game_rooms[i])
		{
			if (room_match_info.get(game_rooms[i]).game_done != 1)//Aka la game est toujours en cours
			{
				console.log("User in game : " + room_match_info.get(game_rooms[i]).player_0_nick + "  " + room_match_info.get(game_rooms[i]).player_1_nick);
				users.push(room_match_info.get(game_rooms[i]).player_0_nick);
				users.push(room_match_info.get(game_rooms[i]).player_1_nick);
			}
			i++;
		}

		this.server.emit("send_user_list", users);
		// client.emit("send_user_list", users);
	};

	@SubscribeMessage('send_username')
	async get_username(client: Socket, user_id)
	{
		console.log("USER ID = " + user_id);
	};

	@SubscribeMessage('up_paddle')
	async up_paddle(client: Socket)
	{
		users_key_status.set(client.id, 1);
	};

	@SubscribeMessage('down_paddle')
	async down_paddle(client: Socket)
	{
		users_key_status.set(client.id, -1);
	};

	@SubscribeMessage('stop_paddle')
	async stop_paddle(client: Socket)
	{
		users_key_status.set(client.id, 0);
	};

	@SubscribeMessage('launch_game')
	async launch_game(client: Socket, config)
	{
		//But : supprimer occurences username / login et les remplacer par nickname
		console.log(client.id + " aka " + config.login + " trys to launch game, gamemode : " + config.mode + " vs " + config.duel);
		users_id.set(client.id, config.login);
		users_name.set(client.id, config.username);
		socket_id.set(config.login, client.id);

		socket_nick.set(client.id, config.nickname);
		nick_socket.set(config.nickname, client.id);

		let launch_game = -1;

		//Won't be used here I think (maybe send a list to client with all games idk then show it in the ui)
		//Will be used config.spec == nickname to spectate
		console.log(config.spec);
		if (config.spec != "")
		{
			console.log(client.id + " is willing to watch |" + config.spec + "|");
			let spec_sock_id = nick_socket.get(config.spec);
			console.log("spec_sock_id = " + spec_sock_id);

			// client.join(socket_id.get(config.spec));
			
			//Check if the user we are willing to spec is still in game
			client.join(socket_infos.get(spec_sock_id).room);

			// console.log(users_name.get(room_match_info.get(socket_id.get(config.spec))[0].id));

			// room_match_info.get(socket_infos.get(nick_socket.get(config.spec)).room).infoRequise
			client.emit("hide_ui");
			client.emit("update_usernames", {right_user: room_match_info.get(socket_infos.get(spec_sock_id).room).player_1_nick, left_user:  room_match_info.get(socket_infos.get(spec_sock_id).room).player_0_nick});

			client.emit("update_score", {ls: room_match_info.get(socket_infos.get(spec_sock_id).room).player_0_score, rs: room_match_info.get(socket_infos.get(spec_sock_id).room).player_1_score});

			//Update bonus positions (they actualy don't apear to specs if they join and a bonus is allready spawned)
			client.emit("update_paddles_size", {lp: room_match_info.get(socket_infos.get(spec_sock_id).room).player_0_paddle_size, rp: room_match_info.get(socket_infos.get(spec_sock_id).room).player_1_paddle_size});

			return ;
		}
		
		duels.set(config.login, config.duel);
		duels_mode.set(config.login, config.mode);
		duels_waiting_room.set(config.login, client);
		//Duels, won't be used
		if (config.duel != null)
		{
			var duel_game_mode = 0;
			if (duels.get(config.duel) == config.login)
			{
				if (config.mode != duels_mode.get(config.duel))
				{
					duel_game_mode = getRandomInt(0, 1);
					config.mode = duel_game_mode;
				}
				else
					duel_game_mode = config.mode;
				console.log("The other player is willing to FIGHT ! Gamemode : " + duel_game_mode);

				launch_game = duel_game_mode;
				var players: Socket[];
				players = [];

				players[0] = duels_waiting_room.get(config.duel);
				players[1] = client;

				duels.delete(config.login);
				duels_mode.delete(config.login);
				duels_waiting_room.delete(config.login);

				duels.delete(config.duel);
				duels_mode.delete(config.duel);
				duels_waiting_room.delete(config.duel);

				players[0].join(players[0].id);
				players[1].join(players[0].id);

				socket_id.set(config.login, players[0].id);

			}
			else
			{
				console.log("Waiting for the other player...");
			}
		}

		//Matchmaking
		else
		{
			client.emit("show_loader");
			if (config.mode == 'Normal Game')
			{
				console.log("User joined normal Matchmaking");
				users_in_matchmaking_0.push(client);
			}
			else
				users_in_matchmaking_1.push(client);
			if (users_in_matchmaking_0.length >= 2) // Classic game
			{
				if (users_in_matchmaking_0[0].id == users_in_matchmaking_0[1].id || user_in_game.get(client.id) != -1)
				{
					console.log("User allready registered !");
					users_in_matchmaking_0.pop();
					return ;
				}
				launch_game = 0;
				var players: Socket[];
				players = [];

				players[0] = users_in_matchmaking_0[0];
				players[1] = client;

				users_in_matchmaking_0 = [];

				console.log(users_in_matchmaking_0.length);

				console.log("2 Users are looking for a Classic game");

				players[0].join(players[0].id);
				players[1].join(players[0].id);

				// socket_id.set(config.login, players[0].id);
			}

			else if (users_in_matchmaking_1.length >= 2) // Bonus game
			{
				if (users_in_matchmaking_1[0].id == users_in_matchmaking_1[1].id || user_in_game.get(client.id) != -1)
				{
					console.log("User allready registered !");
					users_in_matchmaking_1.pop();
					return ;
				}
				launch_game = 1;
				var players: Socket[];
				players = [];

				players[0] = users_in_matchmaking_1[0];
				players[1] = client;

				users_in_matchmaking_1 = [];

				console.log(users_in_matchmaking_1.length);

				console.log("2 Users are looking for a Bonus game");

				players[0].join(players[0].id);
				players[1].join(players[0].id);

				// socket_id.set(config.login, players[0].id);
			}
		}

		if (launch_game != -1) //if launch_game == 0 -> Classic game else if == 1 -> Bonus game
		{
			if (config.mode == 'Normal Game')
			{
				user_in_game.set(players[0].id, 0);
				user_in_game.set(players[1].id, 0);
			}
			else
			{
				user_in_game.set(players[0].id, 1);
				user_in_game.set(players[1].id, 1);				
			}

			this.server.to(players[0].id).emit("update_usernames", {right_user: users_name.get(players[1].id), left_user: users_name.get(players[0].id) });
			this.server.to(players[0].id).emit("hide_loader");
			this.server.to(players[0].id).emit("hide_ui");

			var match_infos =
			{
				player_0_nick: socket_nick.get(players[0].id),
				player_1_nick: socket_nick.get(players[1].id),
				player_0_score: 0,
				player_1_score: 0,
				player_0_socket: players[0],
				player_1_socket: players[1],
				GameStatus: launch_game,
				player_0_paddle_size: 0,
				player_1_paddle_size: 0,
				game_done: 0
			}

			room_match_info.set(players[0].id, match_infos);

			// {UserStatus, Nickname, room}
			var player_0_infos =
			{
				UserStatus: launch_game,
				Nickname: match_infos.player_0_nick,
				room: players[0].id
			}

			var player_1_infos =
			{
				UserStatus: launch_game,
				Nickname: match_infos.player_1_nick,
				room: players[0].id
			}

			socket_infos.set(players[0].id, player_0_infos);
			socket_infos.set(players[1].id, player_1_infos);

			game_rooms.push(players[0].id);

			this.get_player_list(null);
			this.server.to(players[0].id).emit("update_score", {ls: 0, rs: 0});
			// this.server.emit(upda);

			// match_info.push(users_name.get(players[0].id), users_name.get(players[1].id), 0, 0, players[0], players[1],
			// users_id.get(players[0].id), users_id.get(players[1].id), launch_game, 0, 0, 0);
			// room_match_info.set(players[0].id, match_infos);

			var positions = 
			{
				paddle_l_pos_z : 0,
				paddle_r_pos_z : 0,
				paddle_l_pos_x : 0,
				paddle_r_pos_x : 0,
				paddle_l_h_2: 0,
				paddle_r_h_2 : 0,
				bonus_owner: -1,

				arena_top_pos : 0,
				arena_bot_pos : 0,
				arena_bot_pos_2 : 0,
			
				arena_left_pos : 0,
				arena_right_pos : 0,
				arena_right_pos_2 : 0,
				ball_pos_x : 0,
				ball_pos_z : 0,
				ball_speed : 0.5,
				ball_angle : Math.PI,
				PosDiff : 0,
				BaseSpeed : 0.5,
				SpeedIncrease : 0.02,
				SpeedLimit : 1.5,
				RightHit : 0,
				LeftHit : 0,
				RightScore : 0,
				LeftScore : 0,

				bonus_state: 0,
				bonus_type: 0,
				bonus_pos_x: 0,
				bonus_pos_z: 0,
				bonus_counter: 0
			}

			positions.paddle_l_pos_x = config.plx;
			positions.paddle_r_pos_x = config.prx;
			positions.paddle_l_h_2 = config.ph_2;
			positions.paddle_r_h_2 = config.ph_2;
			positions.arena_top_pos = config.at;
			positions.arena_bot_pos = config.ab;
			positions.arena_bot_pos_2 = config.ab/2;
			positions.arena_left_pos = config.al;
			positions.arena_right_pos = config.ar;
			positions.arena_right_pos_2 = config.ar/2;

			positions.bonus_counter = getRandomInt(500, 1000);

			let win = -1;
			//CHANGE SCORE LIMIT HERE
			let score_limit = 99;

			while (win == -1 && match_infos.game_done != 1)// != 1 pour terminer le match
			{
				await sleep(10);
				positions.bonus_counter--;
				//Update paddle pos according to players imput
				if (users_key_status.get(players[1].id) == 1 && positions.paddle_r_pos_z - positions.paddle_r_h_2  > positions.arena_top_pos + 0.1)
				{
					positions.paddle_r_pos_z -= 0.5;
				}

				else if (users_key_status.get(players[1].id) == -1 && positions.paddle_r_pos_z + positions.paddle_r_h_2  < positions.arena_bot_pos - 0.1)
				{
					positions.paddle_r_pos_z += 0.5;
				}

				if (users_key_status.get(players[0].id) == 1 && positions.paddle_l_pos_z - positions.paddle_l_h_2  > positions.arena_top_pos + 0.1)
				{
					positions.paddle_l_pos_z -= 0.5;
				}

				else if (users_key_status.get(players[0].id) == -1 && positions.paddle_l_pos_z + positions.paddle_l_h_2  < positions.arena_bot_pos - 0.1)
				{
					positions.paddle_l_pos_z += 0.5;
				}

				positions.ball_pos_x += Math.cos(positions.ball_angle) * positions.ball_speed;
				positions.ball_pos_z += (Math.sin(positions.ball_angle) * -1) * positions.ball_speed;
		
				this.server.to(players[0].id).emit("update_positions", {bpx: positions.ball_pos_x, bpz: positions.ball_pos_z, lpz: positions.paddle_l_pos_z, rpz: positions.paddle_r_pos_z})

				positions.PosDiff = 0;
		
				//Hit left bar
				if (positions.ball_pos_x >= positions.paddle_l_pos_x - 1 && positions.ball_pos_x <= positions.paddle_l_pos_x + 1 && (positions.ball_pos_z - 0.5 <= positions.paddle_l_pos_z + positions.paddle_l_h_2  && positions.ball_pos_z + 0.5 >= positions.paddle_l_pos_z - positions.paddle_l_h_2 ))
				{
					if (positions.LeftHit == 0)
					{
						positions.LeftHit = 1;
						positions.PosDiff = positions.ball_pos_z - positions.paddle_l_pos_z;
					
						positions.ball_angle = Math.PI - positions.ball_angle;
						if (positions.ball_angle > PI_s.M_2PI)
							positions.ball_angle -= PI_s.M_2PI;
						else if (positions.ball_angle < 0)
							positions.ball_angle += PI_s.M_2PI;
						if (positions.ball_angle - (positions.PosDiff/30) < PI_s.M_PI_2 || positions.ball_angle - (positions.PosDiff/30) > PI_s.M_3PI_2)
							positions.ball_angle -= positions.PosDiff/30;
					
						if (positions.ball_angle > PI_s.M_PI_2 - 0.15 && positions.ball_angle < PI_s.M_3PI_2 - 0.5)
							positions.ball_angle = PI_s.M_PI_2 - 0.15
						else if (positions.ball_angle < PI_s.M_3PI_2 + 0.15 && positions.ball_angle > PI_s.M_PI_2 + 0.5)
							positions.ball_angle = PI_s.M_3PI_2 + 0.15
					
						if (positions.ball_speed < positions.SpeedLimit)
							positions.ball_speed += positions.SpeedIncrease;
							this.server.to(players[0].id).emit("change_ball_color", 0);
							positions.bonus_owner = 0;

						if (launch_game == 1 && positions.bonus_state == 0 && positions.bonus_counter <= 0)
						{
							positions.bonus_counter = getRandomInt(500, 1000);
							positions.bonus_state = 1;
							positions.bonus_type = getRandomInt(0, 10);
							console.log("Bonus type = " + positions.bonus_type);
							positions.bonus_pos_x = getRandomInt(-positions.arena_right_pos_2, positions.arena_right_pos_2);
							positions.bonus_pos_z = getRandomInt(-positions.arena_bot_pos_2, positions.arena_bot_pos_2);
							// positions.bonus_pos_z = 0;//Debug
							this.server.to(players[0].id).emit("spawn_bonus", {isbonus: positions.bonus_type, bx: positions.bonus_pos_x, bz: positions.bonus_pos_z});
						}
					}
					positions.RightHit = 0;
				}
		
				//Hit right bar
				else if (positions.ball_pos_x >= positions.paddle_r_pos_x - 1 && positions.ball_pos_x <= positions.paddle_r_pos_x + 1 && (positions.ball_pos_z - 0.5 <= positions.paddle_r_pos_z + positions.paddle_r_h_2 && positions.ball_pos_z + 0.5 >= positions.paddle_r_pos_z - positions.paddle_r_h_2 ))
				{
					if (positions.RightHit == 0)
					{
					positions.RightHit = 1;
					positions.PosDiff = positions.ball_pos_z - positions.paddle_r_pos_z;
					
					positions.ball_angle = PI_s.M_PI - positions.ball_angle;
					if (positions.ball_angle > PI_s.M_2PI)
						positions.ball_angle -= PI_s.M_2PI;
					else if (positions.ball_angle < 0)
						positions.ball_angle += PI_s.M_2PI;
					if (positions.ball_angle + (positions.PosDiff/30) > PI_s.M_PI_2 && positions.ball_angle + (positions.PosDiff/30) < PI_s.M_3PI_2)
						positions.ball_angle += positions.PosDiff/30;
					
					if (positions.ball_angle < PI_s.M_PI_2 + 0.15)
						positions.ball_angle = PI_s.M_PI_2 + 0.15;
					else if (positions.ball_angle > PI_s.M_3PI_2 - 0.15)
						positions.ball_angle = PI_s.M_3PI_2 - 0.15;
					
					if (positions.ball_speed < positions.SpeedLimit)
						positions.ball_speed += positions.SpeedIncrease;
						this.server.to(players[0].id).emit("change_ball_color", 1);
						positions.bonus_owner = 1;
					}
					if (launch_game == 1 && positions.bonus_state == 0 && positions.bonus_counter <= 0)
					{
						positions.bonus_counter = getRandomInt(500, 1000);
						positions.bonus_state = 1;
						positions.bonus_type = getRandomInt(0, 10);
						console.log("Bonus type = " + positions.bonus_type);
						positions.bonus_pos_x = getRandomInt(-positions.arena_right_pos_2, positions.arena_right_pos_2);
						positions.bonus_pos_z = getRandomInt(-positions.arena_bot_pos_2, positions.arena_bot_pos_2);
						// positions.bonus_pos_z = 0;//Debug
						this.server.to(players[0].id).emit("spawn_bonus", {isbonus: positions.bonus_type, bx: positions.bonus_pos_x, bz: positions.bonus_pos_z});
					}
					positions.LeftHit = 0;
				}

				//Bonus Hit condition
				else if (positions.bonus_state == 1 && positions.bonus_owner != -1 && positions.ball_pos_x + 0.5 >= positions.bonus_pos_x - 1 && positions.ball_pos_x - 0.5 <= positions.bonus_pos_x + 1 && (positions.ball_pos_z - 0.5 <= positions.bonus_pos_z + 1 && positions.ball_pos_z + 0.5 >= positions.bonus_pos_z - 1 ))
				{
					positions.bonus_state = 0;
					if (positions.bonus_owner == 0)
					{
						if (positions.bonus_type < 5)//Le joueur prend un malus
						{
							positions.paddle_l_h_2 = config.ph_2 / 2;
							match_infos.player_0_paddle_size = -1;
						}
						else
						{
							positions.paddle_l_h_2 = config.ph_2 + config.ph_2 / 2;
							match_infos.player_0_paddle_size = 1;
						}
					}
					else
					{
						if (positions.bonus_type < 5)
						{
							positions.paddle_r_h_2 = config.ph_2 / 2;
							match_infos.player_1_paddle_size = -1;
						}
						else
						{
							positions.paddle_r_h_2 = config.ph_2 + config.ph_2 / 2;
							match_infos.player_1_paddle_size = 1;
						}
					}
					this.server.to(players[0].id).emit("bonus_taken", {taker: positions.bonus_owner, bx: positions.bonus_pos_x, bz: positions.bonus_pos_z});
				}
				//Top and bot hit conditions
				if (positions.ball_pos_z <= positions.arena_top_pos || positions.ball_pos_z >= positions.arena_bot_pos)
				{
					positions.ball_angle = PI_s.M_2PI - positions.ball_angle;
					if (positions.ball_angle > PI_s.M_2PI)
						positions.ball_angle -= PI_s.M_2PI;
					else if (positions.ball_angle < 0)
						positions.ball_angle += PI_s.M_2PI;
				}
		
				//Goal conditions
				if (positions.ball_pos_x <= positions.arena_left_pos)
				{
					positions.RightScore += 1;
					match_infos.player_1_score = positions.RightScore;
					if (positions.RightScore == score_limit)
						win = 1;
					this.server.to(players[0].id).emit("update_score", {ls: positions.LeftScore, rs: positions.RightScore});
					match_infos.player_0_paddle_size = positions.LeftScore;
					match_infos.player_1_paddle_size = positions.RightScore;
					resetParams(0, positions, config, match_infos);
				}
		
				else if (positions.ball_pos_x >= positions.arena_right_pos)
				{
					positions.LeftScore += 1;
					match_infos.player_0_score = positions.LeftScore;
					if (positions.LeftScore == score_limit)
						win = 0;
					this.server.to(players[0].id).emit("update_score", {ls: positions.LeftScore, rs: positions.RightScore});
					match_infos.player_0_paddle_size = positions.LeftScore;
					match_infos.player_1_paddle_size = positions.RightScore;
					resetParams(1, positions, config, match_infos);
				}
			}

			if (match_infos.game_done != 1)//Quelqu'un a GAGNÉ LE MATCH
			{
				match_infos.game_done  = 1;
				let win_0 = false;
				let win_1 = false;
				if (win == 0)
				{
					win_0 = true;
					this.server.to(players[0].id).emit("End_of_match", {name: socket_nick.get(players[0].id), pos: "left"});
				}
				else
				{
					win_1 = true;
					this.server.to(players[0].id).emit("End_of_match", {name: socket_nick.get(players[1].id), pos : "right"});
				}

				let index_of_game_room: number;
				index_of_game_room = game_rooms.indexOf(players[0].id);
				game_rooms.splice(index_of_game_room, 1);

				room_match_info.delete(players[0].id);
				user_in_game.set(players[0].id, -1);
				user_in_game.set(players[1].id, -1);
				this.get_player_list(null);
				// let return_tab: UpdateMatchDTO = {winner_0: win_0, points_0: positions.LeftScore, userId_0: users_id.get(players[0].id),
				// winner_1 : win_1, points_1: positions.RightScore, userId_1: users_id.get(players[1].id), game_mode: config.mode};

				// this.MatchService.createMatch(return_tab);
			}
			// console.log(await this.MatchService.getMatchsOfUser(users_id.get(players[1].id)));
		}
	};
};

function sleep(ms)
{
	return new Promise(resolve => setTimeout(resolve, ms));
}

function resetParams(x : number, positions: any, config: any, match_infos: any)
{
	positions.ball_pos_x = 0;
	positions.ball_pos_z = 0;

	positions.paddle_l_pos_z = 0;
	positions.paddle_r_pos_z = 0;

	positions.paddle_l_h_2 = config.ph_2;
	positions.paddle_r_h_2 = config.ph_2;
	match_infos.player_1_paddle_size = 0;
	match_infos.player_0_paddle_size = 0;

	if (x == 0)
		positions.ball_angle = Math.PI;
	else
		positions.ball_angle = Math.PI * 2;
	positions.ball_speed = positions.BaseSpeed;
	positions.LeftHit = 0;
	positions.RightHit = 0;
	positions.bonus_owner = -1;
};

function getRandomInt(min, max)
{
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min)) + min;
};
