import { SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Socket, Server } from "socket.io";

var users_in_matchmaking_0 : Socket [];
var users_in_matchmaking_1 : Socket [];
var game_rooms: string [];

const users_key_status = new Map();

const users_id = new Map();
const users_name = new Map();
const socket_id = new Map();

// const duels = new Map();
// const duels_mode = new Map();
// const duels_waiting_room = new Map();

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

users_in_matchmaking_0 = [];
users_in_matchmaking_1 = [];
game_rooms = [];

var PI_s = 
{
	M_PI : Math.PI,
	M_2PI : 2 * Math.PI,
	M_PI_2 : Math.PI / 2,
	M_3PI_2 : 3 * (Math.PI / 2)
};

var score_limit = 7;

let arena_config = {
	arena_w: 100,
	arena_w_2: 0,
	arena_h: 50,
	arena_h_2: 0,
	arena_size: 0,
  
	paddle_w: 1,
	paddle_h: 10,
	paddle_h_2: 0,
  };

  arena_config.paddle_h_2 = arena_config.paddle_h / 2;
  arena_config.arena_h_2 = arena_config.arena_h / 2;
  arena_config.arena_w_2 = arena_config.arena_w / 2;

@WebSocketGateway(
	{
		cors: {origin:'http://localhost:8080',
		methods: ['GET', 'POST'],
		credentials: true}
	}
)
export class PongGateway
{
	@WebSocketServer()
	server: Server;

	afterInit(server: Server)
	{
		console.log("game socket init !");
	}

	handleConnection(client: Socket)
	{
		this.get_player_list(client);

		console.log (client.id + " has joined the server");
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
		index_of_client_0 = users_in_matchmaking_0.indexOf(client);
		index_of_client_1 = users_in_matchmaking_1.indexOf(client);

		if (index_of_client_0 != -1)
			users_in_matchmaking_0.splice(index_of_client_0, 1);
		else if (index_of_client_1 != -1)
			users_in_matchmaking_1.splice(index_of_client_1, 1);
		else if (socket_infos.get(client.id))
		{
			let player_room = socket_infos.get(client.id).room;
			if (room_match_info.get(player_room) != null)
			{
				if (room_match_info.get(player_room).game_done != 1) //Player was in a running game
				{
					//reset user_in_game.set(client.id, -1); for both players
					user_in_game.set(room_match_info.get(player_room).player_0_socket.id, -1);
					user_in_game.set(room_match_info.get(player_room).player_1_socket.id, -1);

					room_match_info.get(player_room).game_done  = 1;//End the game
					room_match_info.get(socket_id.get(users_id.get(client.id)));
					this.server.to(player_room).emit("User_disconected", socket_nick.get(client.id));

					console.log("A user LEFT A RUNNING MATCH");
				}
				index_of_game_room = game_rooms.indexOf(player_room);
				game_rooms.splice(index_of_game_room, 1);
				room_match_info.delete(player_room);
				this.get_player_list(null);
			}
		}
		// duels.delete(users_id.get(client.id));
		// duels_mode.delete(users_id.get(client.id));
		// duels_waiting_room.delete(users_id.get(client.id));
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

	@SubscribeMessage('leave_spec')
	async leave_spec(client: Socket, user_to_watch)
	{
		let spec_sock_id = nick_socket.get(user_to_watch);
		client.leave(socket_infos.get(spec_sock_id).room);
	};

	@SubscribeMessage('get_player_list')
	async get_player_list(client: Socket)
	{
		let i: number = 0;
		var users: string [];

		users = [];

		while (game_rooms[i])
		{
			if (room_match_info.get(game_rooms[i]).game_done != 1)//the game is still runing
			{
				users.push(room_match_info.get(game_rooms[i]).player_0_nick);
				users.push(room_match_info.get(game_rooms[i]).player_1_nick);
			}
			i++;
		}

		this.server.emit("send_user_list", users);
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
		users_id.set(client.id, config.nickname);
		users_name.set(client.id, config.nickname);
		socket_id.set(config.nickname, client.id);

		socket_nick.set(client.id, config.nickname);
		nick_socket.set(config.nickname, client.id);

		let launch_game = -1;

		if (config.spec != "")
		{
			console.log(client.id + " is willing to spec " + config.spec);
			let spec_sock_id = nick_socket.get(config.spec);
			client.join(socket_infos.get(spec_sock_id).room);
			client.emit("hide_ui");

			client.emit("update_usernames", {right_user: room_match_info.get(socket_infos.get(spec_sock_id).room).player_1_nick, left_user:  room_match_info.get(socket_infos.get(spec_sock_id).room).player_0_nick});
			client.emit("update_score", {ls: room_match_info.get(socket_infos.get(spec_sock_id).room).player_0_score, rs: room_match_info.get(socket_infos.get(spec_sock_id).room).player_1_score});
			client.emit("update_paddles_size", {lp: room_match_info.get(socket_infos.get(spec_sock_id).room).player_0_paddle_size, rp: room_match_info.get(socket_infos.get(spec_sock_id).room).player_1_paddle_size});
			return ;
		}
		
				//Duels, won't be used
		// duels.set(config.nickname, config.duel);
		// duels_mode.set(config.nickname, config.mode);
		// duels_waiting_room.set(config.nickname, client);
		/*
		if (config.duel != null)
		{
			var duel_game_mode = 0;
			if (duels.get(config.duel) == config.nickname)
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

				duels.delete(config.nickname);
				duels_mode.delete(config.nickname);
				duels_waiting_room.delete(config.nickname);

				duels.delete(config.duel);
				duels_mode.delete(config.duel);
				duels_waiting_room.delete(config.duel);

				players[0].join(players[0].id);
				players[1].join(players[0].id);

				socket_id.set(config.nickname, players[0].id);

			}
			else
			{
				console.log("Waiting for the other player...");
			}
		}
		*/

		//Matchmaking
		else
		{
			console.log(client.id + " aka " + config.nickname + " trys to launch game, gamemode : " + config.mode);
			client.emit("show_loader");
			if (config.mode == 'Normal Game')
			{
				console.log(client.id + " joined normal Matchmaking");
				users_in_matchmaking_0.push(client);
			}
			else
			{
				console.log(client.id + " joined bonus Matchmaking");
				users_in_matchmaking_1.push(client);
			}
			if (users_in_matchmaking_0.length >= 2) // Classic game
			{
				if (users_in_matchmaking_0[0].id == users_in_matchmaking_0[1].id || user_in_game.get(client.id) != -1)//Impossible in theory
				{
					console.log("User" + client.id + " allready registered !");
					users_in_matchmaking_0.pop();
					return ;
				}
				launch_game = 0;
				var players: Socket[];
				players = [];

				players[0] = users_in_matchmaking_0[0];
				players[1] = client;

				users_in_matchmaking_0 = [];
				console.log("2 Users are looking for a Classic game");

				players[0].join(players[0].id);
				players[1].join(players[0].id);

				// socket_id.set(config.nickname, players[0].id);
			}

			else if (users_in_matchmaking_1.length >= 2) // Bonus game
			{
				if (users_in_matchmaking_1[0].id == users_in_matchmaking_1[1].id || user_in_game.get(client.id) != -1)
				{
					console.log("User" + client.id + " allready registered !");
					users_in_matchmaking_1.pop();
					return ;
				}
				launch_game = 1;
				var players: Socket[];
				players = [];

				players[0] = users_in_matchmaking_1[0];
				players[1] = client;

				users_in_matchmaking_1 = [];
				console.log("2 Users are looking for a Bonus game");

				players[0].join(players[0].id);
				players[1].join(players[0].id);

				// socket_id.set(config.nickname, players[0].id);
			}
		}

		if (launch_game != -1) //if launch_game == 0 -> Classic game else if == 1 -> Bonus game
		{
			if (config.mode == 'Normal Game')
			{
				console.log("launching a classic game");
				user_in_game.set(players[0].id, 0);
				user_in_game.set(players[1].id, 0);
			}
			else
			{
				console.log("launching a bonus game");
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
			var positions = 
			{
				paddle_l_pos_z : 0,
				paddle_r_pos_z : 0,
				paddle_l_pos_x : -(arena_config.arena_w / 2 - 5),
				paddle_r_pos_x : arena_config.arena_w / 2 - 5,
				paddle_l_h_2: arena_config.paddle_h_2,
				paddle_r_h_2 : arena_config.paddle_h_2,
				bonus_owner: -1,

				arena_top_pos : -arena_config.arena_h_2 + 1,
				arena_bot_pos : arena_config.arena_h_2 - 1,
				arena_bot_pos_2 : 0,
			
				arena_left_pos : -arena_config.arena_w_2 + 1,
				arena_right_pos : arena_config.arena_w_2 - 1,
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
			positions.arena_bot_pos_2 = positions.arena_bot_pos/2;
			positions.arena_right_pos_2 = positions.arena_right_pos/2;

			positions.bonus_counter = getRandomInt(500, 1000);

			let win = -1;
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
				if (win == 0)
					this.server.to(players[0].id).emit("End_of_match", {name: socket_nick.get(players[0].id), pos: "left"});
				else
					this.server.to(players[0].id).emit("End_of_match", {name: socket_nick.get(players[1].id), pos : "right"});

				let index_of_game_room: number;
				index_of_game_room = game_rooms.indexOf(players[0].id);
				game_rooms.splice(index_of_game_room, 1);

				room_match_info.delete(players[0].id);
				user_in_game.set(players[0].id, -1);
				user_in_game.set(players[1].id, -1);
				this.get_player_list(null);
			}
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
