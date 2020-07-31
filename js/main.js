var PLAYGROUND_WIDTH	= 600;
var PLAYGROUND_HEIGHT	= 400;
var REFRESH_RATE			= 15;

var playerAnimation = new Array();

function debug(){
	$("#player")[0].player.life = 100;
}

function kill(){
	$("#player")[0].player.life = 0;
}

function restartgame(){
	window.location.reload();
}

function Player(node){
	this.node = node;
	this.number = 0;
	this.life = 5;
	this.score = 0;
	this.bombs = 3;
	this.die = false;
	this.shoot = false;
	this.bomb = false;
	this.up = false;
	this.ascore = 0;
	this.hit = function(){
		this.life--;
		this.ascore = 0;
		if(this.life<=0){
			this.die=true;
		}
	}
	this.kill = function(){
		this.score++;
		this.ascore++;
	}
	this.killboss = function(){
		this.score += 3;
		this.ascore++;
	}
}

function Platform(node){
	this.node = node;
	this.node.css("background-color","#22281d");
}

function Mine(node){
	this.node = node;
	this.speedx	= -10;
	this.updateX= function(){		
		this.node.x(this.speedx, true);
	}
}

function Bomberman(node){
	this.node = node;
	this.speedx	= 4;
	this.updateX= function(){		
		this.node.x(this.speedx, true);
	}
}

function Enemy(node){
	this.node = node;
	this.speedx	= -4;
	this.updateX= function(){		
		this.node.x(this.speedx, true);
	}
	this.life = 3;
	this.hit = function(){
		this.life--;
	}
}

$(function(){
	var background1 = new $.gQ.Animation({imageURL: "./img/background.png"});
	var background2 = new $.gQ.Animation({imageURL: "./img/background.png"});
	var mine = new $.gQ.Animation({imageURL: "./img/mine.png", numberOfFrame: 3, delta: 32, rate: 120, type: $.gQ.ANIMATION_HORIZONTAL});
	
	var bomberman = new $.gQ.Animation({imageURL: "./img/bomberman.png"});
	var laser = new $.gQ.Animation({imageURL: "./img/laser.png"});
	
	var enemy = new $.gQ.Animation({imageURL: "./img/enemy.png", numberOfFrame: 3, delta: 99, rate: 120, type: $.gQ.ANIMATION_HORIZONTAL});
	
	var explosion = new $.gQ.Animation({imageURL: "./img/explosion.png", numberOfFrame: 9	, delta: 50, rate: 50, type: $.gQ.ANIMATION_HORIZONTAL | $.gQ.ANIMATION_ONCE});
	
	var flash = new $.gQ.Animation({imageURL: "./img/flash.png", numberOfFrame: 15	, delta: 600, rate: 5, type: $.gQ.ANIMATION_HORIZONTAL | $.gQ.ANIMATION_ONCE});
	
	playerAnimation["move"]	= new $.gQ.Animation({imageURL: "./img/tank.png", numberOfFrame: 2, delta: 78, distance: 14, rate: 120, type: $.gQ.ANIMATION_HORIZONTAL});
	var missile = new $.gQ.Animation({imageURL: "./img/missile.png"});
	playerAnimation["shoot"]	= new $.gQ.Animation({imageURL: "./img/tankshoot.png"});
	
	$("#playground")
		.playground({height: PLAYGROUND_HEIGHT, width: PLAYGROUND_WIDTH, keyTracker: true})
		.addGroup("background", {width: PLAYGROUND_WIDTH, height: PLAYGROUND_HEIGHT})
			.addSprite("background1", {animation: background1, width: PLAYGROUND_WIDTH, height: PLAYGROUND_HEIGHT})
			.addSprite("background2", {animation: background2, width: PLAYGROUND_WIDTH, height: PLAYGROUND_HEIGHT, posx: PLAYGROUND_WIDTH})
		.end()
		.addGroup("actors", {width: PLAYGROUND_WIDTH, height: PLAYGROUND_HEIGHT})
			.addSprite("player",{animation: playerAnimation["move"], posx: 50, posy: 250, width: 78, height: 60})
		.end()
		.addGroup("playerMissileLayer",{width: PLAYGROUND_WIDTH, height: PLAYGROUND_HEIGHT}).end()
		.addGroup("enemyMissileLayer",{width: PLAYGROUND_WIDTH, height: PLAYGROUND_HEIGHT}).end()
		.addGroup("items", {width: PLAYGROUND_WIDTH, height: PLAYGROUND_HEIGHT})
			.addSprite("platform",{posx: 0, posy: 310, width: PLAYGROUND_WIDTH, height: 90})
		.end()
		.addGroup("overlay",{width: PLAYGROUND_WIDTH, height: 100})
		.end()
	
	$.playground().registerCallback(function(){
		if(Math.floor((Math.random()*5)+1) == 1){	
			if(Math.floor((Math.random()*5)+1) == 1 && $(".enemy").length == 0){
				var name = "enemy_"+Math.ceil(Math.random()*1000);
				$("#actors").addSprite(name, {animation: enemy, posx: PLAYGROUND_WIDTH, posy: 240, width: 99, height: 69});					
				$("#"+name).addClass("enemy");
				$("#"+name)[0].enemy = new Enemy($("#"+name));
			}
		}
		else{
			if(Math.floor((Math.random()*2)+1) == 1){
				var name = "mine_"+Math.ceil(Math.random()*1000);
				$("#actors").addSprite(name, {animation: mine, posx: PLAYGROUND_WIDTH, posy: 290, width: 32, height: 20});					
				$("#"+name).addClass("mine");
				$("#"+name)[0].mine = new Mine($("#"+name));
			}
		}
		if(Math.floor((Math.random()*10)+1) == 1){
			var name = "bomberman_"+Math.ceil(Math.random()*1000);
			$("#actors").addSprite(name, {animation: bomberman, posx: -48, posy: 50, width: 48, height: 38});					
			$("#"+name).addClass("bomberman");
			$("#"+name)[0].bomberman = new Bomberman($("#"+name));
		}
	},800);
		
	$("#player")[0].player = new Player($("#player"));
	$("#platform").addClass("platform");
	$("#platform")[0].platform = new Platform($("#platform"));
	
	$("#overlay").append('<div id="lifeHUD"><h3 id="life">Lives:</h3></div><div id="bombHUD"><h3 id="bombs">Bombs:</h3></div><div id="scoreHUD"><h3 id="score">Score:</h3></div><div id="announcerHUD"><h2 id="announcer"></h2></div>');
	
	$.playground().registerCallback(function(){
		
		var newPos = (parseInt($("#background1").x()) - 1 - PLAYGROUND_WIDTH)%(-2 * PLAYGROUND_WIDTH) + PLAYGROUND_WIDTH;
		$("#background1").x(newPos);

		newPos = (parseInt($("#background2").x()) - 1 - PLAYGROUND_WIDTH)%(-2 * PLAYGROUND_WIDTH) + PLAYGROUND_WIDTH;
		$("#background2").x(newPos);
		
		$(".mine").each(function(){
			this.mine.updateX();
			var collided = $(this).collision("#player, #actors");
			if(collided.length > 0){			
				$("#player")[0].player.hit();
				
				$(".explosion").remove();
				var name = "explosion"+Math.ceil(Math.random()*1000);
				$("#actors").addSprite(name, {animation: explosion, posx: $(this).x(), posy: $(this).y()-30, width: 50, height: 50});
				$("#"+name).addClass("explosion");
				
				$(this).remove();
			}
			if ($(this).x() < -32){
				$(this).remove();
			}
		});
		
		$(".enemy").each(function(){
			this.enemy.updateX();
			var collided = $(this).collision("#player, #actors");
			if(collided.length > 0){			
				$(".explosion").remove();
				var name = "explosion"+Math.ceil(Math.random()*1000);
				$("#actors").addSprite(name, {animation: explosion, posx: $(this).x(), posy: $(this).y(), width: 50, height: 50});
				$("#"+name).addClass("explosion");
				
				$(this).remove();
				$("#player")[0].player.hit();
			}
			var collided2 = $(this).collision(".playerMissiles, #playerMissileLayer");
			if(collided2.length > 0){		
				$(".playerMissiles").each(function(){
					var collided2 = $(this).collision(".enemy, #actors");
					if(collided2.length > 0){
						$(".explosion").remove();
						var name = "explosion"+Math.ceil(Math.random()*1000);
						$("#actors").addSprite(name, {animation: explosion, posx: $(this).x(), posy: $(this).y()-15, width: 50, height: 50});
						$("#"+name).addClass("explosion");
						
						$(this).remove();
					}
				});
				this.enemy.hit();
			}
			if(this.enemy.life == 0){
				$(this).remove()
				$("#player")[0].player.killboss();
			}
		});
		
		$(".bomberman").each(function(){
			this.bomberman.updateX();
			var collided = $(this).collision(".playerMissiles2, #playerMissileLayer");
			if(collided.length > 0){		
				$(".playerMissiles2").each(function(){
					var collided2 = $(this).collision(".bomberman, #actors");
					if(collided2.length > 0){
						$(".explosion").remove();
						var name = "explosion"+Math.ceil(Math.random()*1000);
						$("#actors").addSprite(name, {animation: explosion, posx: $(this).x(), posy: $(this).y()-30, width: 50, height: 50});
						$("#"+name).addClass("explosion");
						
						$(this).remove();
					}
				});
				$(this).remove();
				$("#player")[0].player.kill();
			}
			if ($(this).x() < $("#player").x() + 5 && $(this).x() > $("#player").x() - 5 && $(".enemyMissiles").length == 0){
				var playerposx = $("#player").x();
				var playerposy = $("#player").y();
				var name = "enemyMissle_"+Math.ceil(Math.random()*1000);
				$("#enemyMissileLayer").addSprite(name,{animation: laser, posx: playerposx + 24, posy: $(this).y() + 10, width: 6, height: 28});
				$("#"+name).addClass("enemyMissiles");
			}
			if ($(this).x() > PLAYGROUND_WIDTH){
				$(this).remove();
			}
		});
		
		$(".playerMissiles").each(function(){
			var posx = $(this).x();
			$(this).x(10, true);
			if (posx > $("#player").x() + 300){
				$(this).remove();
			}
		});
		
		$(".playerMissiles2").each(function(){
			var posx = $(this).x();
			var posy = $(this).y();
			$(this).x(10, true);
			$(this).y(-10, true);
			if (posx > $("#player").x() + 350){
				$(this).remove();
			}
		});
		
		$(".enemyMissiles").each(function(){
			var posy = $(this).y();
			if(posy > 310){
				$(this).remove();
				return;
			}	
			$(this).y(5, true);
			var collided = $(this).collision("#player, #actors");
			if(collided.length > 0){
				$(".explosion").remove();
				var name = "explosion"+Math.ceil(Math.random()*1000);
				$("#actors").addSprite(name, {animation: explosion, posx: $(this).x()-10, posy: $(this).y()-30, width: 50, height: 50});
				$("#"+name).addClass("explosion");
				$(this).remove();
				$("#player")[0].player.hit();
			}
		});
		
		if($("#player")[0].player.up == true){
			setTimeout(function(){$("#player").setAnimation(playerAnimation["move"])},200);
			$("#player")[0].player.up = false;
		}
		
		if(jQuery.gameQuery.keyTracker[65] && $("#player")[0].player.number == 0){
			var nextpos = $("#player").x()-4;
			if(nextpos > 0){
				$("#player").x(nextpos);
			}
		}
		if(jQuery.gameQuery.keyTracker[68] && $("#player")[0].player.number == 0){
			var nextpos = $("#player").x()+4;
			if(nextpos < PLAYGROUND_WIDTH-64){
				$("#player").x(nextpos);
			}
		}
		if(jQuery.gameQuery.keyTracker[87] && $("#player")[0].player.number == 0){
			$.playground().registerCallback(function(){
				if($("#player")[0].player.number < 12){					
					var nextpos = $("#player").y()-7;
					$("#player").y(nextpos);
					$("#player")[0].player.number+=1;
				}
			}, REFRESH_RATE);	
		}
		if($("#player")[0].player.number > 10){
			$.playground().registerCallback(function(){
				if($("#player")[0].player.number > -1){				
					var nextpos = $("#player").y()+7;
					$("#player").y(nextpos);
					$("#player")[0].player.number-=1;
				}
			}, REFRESH_RATE);	
		}
		if(jQuery.gameQuery.keyTracker[75] && $("#player")[0].player.shoot == 0 && $("#player")[0].player.number == 0){
			$("#player").setAnimation(playerAnimation["shoot"]);
			var playerposx = $("#player").x();
			var playerposy = $("#player").y();
			var name = "playerMissle_"+Math.ceil(Math.random()*1000);
			$("#playerMissileLayer").addSprite(name,{animation: missile, posx: playerposx + 70, posy: playerposy + 18, width: 16,height: 36});
			$("#"+name).addClass("playerMissiles");
			var playerposx = $("#player").x();
			var playerposy = $("#player").y();
			var name = "playerMissle_"+Math.ceil(Math.random()*1000);
			$("#playerMissileLayer").addSprite(name,{animation: missile, posx: playerposx + 70, posy: playerposy + 18, width: 16,height: 36});
			$("#"+name).addClass("playerMissiles2");
			$("#player")[0].player.shoot = true;
			setTimeout(function(){$("#player")[0].player.shoot = false}, 1000);
			$("#player")[0].player.up = true;
		}
		if(jQuery.gameQuery.keyTracker[76] && $("#player")[0].player.bombs > 0 && $("#player")[0].player.bomb == false){
			$(".bomberman").remove();
			$(".enemy").remove();
			$(".mine").remove();
			$(".enemyMissiles").remove();
			$("#items").addSprite("flash",{animation: flash, posx: 0, posy: 0, width: PLAYGROUND_WIDTH, height: PLAYGROUND_HEIGHT});
			setTimeout(function(){$("#flash").remove()}, 1000);
            $("#player")[0].player.bombs--;
			$("#player")[0].player.bomb = true;
			setTimeout(function(){$("#player")[0].player.bomb = false}, 1000);
		}
		
		if($("#player")[0].player.life < 0){
			$("#player")[0].player.life == 0;
		}
		
		$("#score").html("Score: "+$("#player")[0].player.score);
		$("#life").html("Lives: "+$("#player")[0].player.life);
		$("#bombs").html("Bombs: "+$("#player")[0].player.bombs);
		
		if($("#player")[0].player.die == true){
			$("#actors").remove();
			$("#items").remove();
			$("#playerMissileLayer").remove();
			$("#enemyMissileLayer").remove();
			$("#background").remove();
			$('#splash').fadeTo(1000,1,function(){
				$(this).show();
			});
			$('#splashContent3').fadeTo(1000,1,function(){
				$(this).show();
			});
		}
	}, REFRESH_RATE);

	$('#splashContent2').hide();
	$('#splashContent3').hide();
	
	$("#start").click(function(){
		$('#splashContent1').fadeTo(500,0,function(){
			$('#splashContent2').fadeTo(500,1,function(){
				$(this).show();
			});
			$(this).hide();
		});
	});
	
	$("#startGame").click(function(){
		$('#splashContent2').fadeTo(1000,0,function(){
			$(this).hide();
		});
		$('#splash').fadeTo(1000,0,function(){
			$.playground().startGame();
		});
	});
});
