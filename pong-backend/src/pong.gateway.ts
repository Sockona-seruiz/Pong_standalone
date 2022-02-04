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

var users_in_matchmaking_0 : Socket [];
var users_in_matchmaking_1 : Socket [];

const users_key_status = new Map();

const users_id = new Map();
const users_name = new Map();
const socket_id = new Map();

const duels = new Map();
const duels_mode = new Map();
const duels_waiting_room = new Map();

const room_match_info = new Map();

users_in_matchmaking_0 = [];
users_in_matchmaking_1 = [];

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
		console.log (client.id + " has join the matchmaking");
		users_key_status.set(client.id, 0);
		users_id.set(client.id, -1);
		return;
	};

	async handleDisconnect(client: Socket)
	{
		let index_of_client_0: number;
		let index_of_client_1: number;

		console.log (client.id + " has left the matchmaking");
		// client.leave(client.id);
		index_of_client_0 = users_in_matchmaking_0.indexOf(client);
		index_of_client_1 = users_in_matchmaking_1.indexOf(client);

		if (index_of_client_0 != -1)
		{
			users_in_matchmaking_0.splice(index_of_client_0, 1);
			console.log("users in classic matchmaking : " + users_in_matchmaking_0.length);
			// await this.userService.changeStatus(users_id.get(client.id), Status.Online);
		}
		else if (index_of_client_1 != -1)
		{
			users_in_matchmaking_1.splice(index_of_client_1, 1);
			console.log("users in bonus matchmaking : " + users_in_matchmaking_1.length);
			// await this.userService.changeStatus(users_id.get(client.id), Status.Online);
		}
		else if (room_match_info.get(socket_id.get(users_id.get(client.id))))
		{
			console.log("OUI ON PASSE PAR LA  " + room_match_info.get(socket_id.get(users_id.get(client.id))));
			if (room_match_info.get(socket_id.get(users_id.get(client.id)))[9] != 1) //Le joeur était en game
			{
				var game_room: string;

				room_match_info.get(socket_id.get(users_id.get(client.id)))[9] = 1;
				game_room = socket_id.get(users_id.get(client.id));
				console.log("Game socket = " + game_room);
				room_match_info.get(socket_id.get(users_id.get(client.id)));
				this.server.to(socket_id.get(users_id.get(client.id))).emit("User_disconected", users_name.get(client.id));

				console.log("A user LEFT A RUNNING MATCH");


				console.log(room_match_info.get(socket_id.get(users_id.get(client.id)))[4]);

				let data_picker = socket_id.get(users_id.get(client.id));
				//Remettre le deux user Online
				// await this.userService.changeStatus(room_match_info.get(data_picker)[6], Status.Online);
				// await this.userService.changeStatus(room_match_info.get(data_picker)[7], Status.Online);

				let win_0 = false;
				let win_1 = false;

				if (room_match_info.get(data_picker)[4].id == client.id)
					win_1 = true;
				else
					win_0 = true;

				room_match_info.get(data_picker).push(1);

				// let return_tab: UpdateMatchDTO = {winner_0: win_0, points_0: room_match_info.get(data_picker)[2], userId_0: room_match_info.get(data_picker)[6],
				// 	winner_1 : win_1, points_1: room_match_info.get(data_picker)[3], userId_1: room_match_info.get(data_picker)[7], game_mode: room_match_info.get(data_picker)[8]};
				// this.MatchService.createMatch(return_tab);
			}
			else
			{
				room_match_info.delete(socket_id.get(users_id.get(client.id)));
			}
		}

		duels.delete(users_id.get(client.id));
		duels_mode.delete(users_id.get(client.id));
		duels_waiting_room.delete(users_id.get(client.id));

		users_id.delete(client.id);
		users_key_status.delete(client.id);
		users_name.delete(client.id);
		return;
	};

	@SubscribeMessage('send_username')
	async get_username(client: Socket, user_id)
	{
		console.log("USER ID = " + user_id);
	}

	@SubscribeMessage('up_paddle')
	async up_paddle(client: Socket)
	{
		users_key_status.set(client.id, 1);
	}

	@SubscribeMessage('down_paddle')
	async down_paddle(client: Socket)
	{
		users_key_status.set(client.id, -1);
	}

	@SubscribeMessage('stop_paddle')
	async stop_paddle(client: Socket)
	{
		users_key_status.set(client.id, 0);
	}

	@SubscribeMessage('launch_game')
	async launch_game(client: Socket, config)
	{
		console.log(client.id + " aka " + config.login + " trys to launch game, gamemode : " + config.mode + " vs " + config.duel);
		users_id.set(client.id, config.login);
		users_name.set(client.id, config.username);
		socket_id.set(config.login, client.id);

		let launch_game = -1;

		console.log(config.spec);
		if (config.spec != null)
		{
			console.log(client.id + " is willing to watch a game " + socket_id.get(config.spec));
			client.join(socket_id.get(config.spec));
			// console.log(users_name.get(room_match_info.get(socket_id.get(config.spec))[0].id));
			client.emit("update_usernames", {right_user: room_match_info.get(socket_id.get(config.spec))[1], left_user:  room_match_info.get(socket_id.get(config.spec))[0]});
			client.emit("update_score", {ls: room_match_info.get(socket_id.get(config.spec))[2], rs: room_match_info.get(socket_id.get(config.spec))[3] });
			client.emit("update_paddles_size", {lp: room_match_info.get(socket_id.get(config.spec))[10], rp: room_match_info.get(socket_id.get(config.spec))[11] });
			return ;
		}
		
		duels.set(config.login, config.duel);
		duels_mode.set(config.login, config.mode);
		duels_waiting_room.set(config.login, client);		
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

		else
		{
			if (config.mode == 0)
				users_in_matchmaking_0.push(client);
			else
				users_in_matchmaking_1.push(client);

			if (users_in_matchmaking_0.length >= 2) // Classic game
			{
				if (users_id.get(users_in_matchmaking_0[0].id) == users_id.get(users_in_matchmaking_0[1].id))
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

				console.log("2 Users or more are looking for a Classic game");

				players[0].join(players[0].id);
				players[1].join(players[0].id);

				socket_id.set(config.login, players[0].id);
			}

			else if (users_in_matchmaking_1.length >= 2) // Bonus game
			{
				if (users_id.get(users_in_matchmaking_1[0].id) == users_id.get(users_in_matchmaking_1[1].id))
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

				console.log("2 Users or more are looking for a Bonus game");

				players[0].join(players[0].id);
				players[1].join(players[0].id);

				socket_id.set(config.login, players[0].id);
			}
		}

		if (launch_game != -1) //if launch_game == 0 -> Classic game else if == 1 -> Bonus game
		{
			// await this.userService.changeStatus(users_id.get(players[0].id), Status.Ongame);
			// await this.userService.changeStatus(users_id.get(players[1].id), Status.Ongame);

			// console.log(await this.userService.findById(users_id.get(players[0].id)));

			var	match_info: any []; //user_name_0, user_name_1, score_0, score_1, socket_0, socket_1, id_0, id_1, game_mode, is_game_ended, paddle_l_size, paddle_r_size -> 0 = normal -1 = small 1 = huge
			match_info = [];

			this.server.to(players[0].id).emit("update_usernames", {right_user: users_name.get(players[1].id), left_user: users_name.get(players[0].id) });
			match_info.push(users_name.get(players[0].id), users_name.get(players[1].id), 0, 0, players[0], players[1],
			users_id.get(players[0].id), users_id.get(players[1].id), launch_game, 0, 0, 0);
			room_match_info.set(players[0].id, match_info);
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
			let score_limit = 7;

			while (win == -1 && match_info[9] != 1)// != 1 pour terminer le match
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
							positions.bonus_pos_z = 0;//Debug
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
						positions.bonus_pos_z = 0;//Debug
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
							match_info[10] = -1;
						}
						else
						{
							positions.paddle_l_h_2 = config.ph_2 + config.ph_2 / 2;
							match_info[10] = 1;
						}
					}
					else
					{
						if (positions.bonus_type < 5)
						{
							positions.paddle_r_h_2 = config.ph_2 / 2;
							match_info[11] = -1;
						}
						else
						{
							positions.paddle_r_h_2 = config.ph_2 + config.ph_2 / 2;
							match_info[11] = 1;
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
					if (positions.RightScore == score_limit)
						win = 1;
					this.server.to(players[0].id).emit("update_score", {ls: positions.LeftScore, rs: positions.RightScore});
					match_info[2] = positions.LeftScore;
					match_info[3] = positions.RightScore;
					resetParams(0, positions, config, match_info);
				}
		
				else if (positions.ball_pos_x >= positions.arena_right_pos)
				{
					positions.LeftScore += 1;
					if (positions.LeftScore == score_limit)
						win = 0;
					this.server.to(players[0].id).emit("update_score", {ls: positions.LeftScore, rs: positions.RightScore});
					match_info[2] = positions.LeftScore;
					match_info[3] = positions.RightScore;
					resetParams(1, positions, config, match_info);
				}
			}

			if (match_info[9] != 1)//Quelqu'un a GAGNÉ LE MATCH
			{
				match_info[9] = 1;
				let win_0 = false;
				let win_1 = false;
				if (win == 0)
				{
					win_0 = true;
					this.server.to(players[0].id).emit("End_of_match", {name :users_name.get(players[0].id), pos: "left"});
				}
				else
				{
					win_1 = true;
					this.server.to(players[0].id).emit("End_of_match", {name: users_name.get(players[1].id), pos : "right"});
				}
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

function resetParams(x : number, positions: any, config: any, match_info: any)
{
	positions.ball_pos_x = 0;
	positions.ball_pos_z = 0;

	positions.paddle_l_pos_z = 0;
	positions.paddle_r_pos_z = 0;

	positions.paddle_l_h_2 = config.ph_2;
	positions.paddle_r_h_2 = config.ph_2;
	match_info[10] = 0;
	match_info[11] = 1;

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
