<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />	
		<title>Radio Player</title>	
		<link href="style.css" rel="stylesheet" type="text/css" />
		<link href="owl.carousel.css" rel="stylesheet" />
		<link href="owl.theme.css" rel="stylesheet" />
		<link href='http://fonts.googleapis.com/css?family=Open+Sans:300,400,600,700,800' rel='stylesheet' type='text/css' />	
		<script type="application/javascript" src="js/jquery-2.1.3.min.js"></script> 
		<script type="application/javascript" src="js/owl.carousel.js"></script>
		<script type="application/javascript" src="js/init.js"></script>
		<script type="application/javascript" src="js/load-config.js"></script>
		<script type="application/javascript" src="js/player-loader.js"></script>
		<script type="application/javascript" src="js/audio.js"></script>	
		<script type="application/javascript" src="https://www.youtube.com/player_api"></script>
		<script type="application/javascript" src="js/youtube.js"></script>
		<script type="application/javascript">
			window.onload = function(){
				player.container = "putinit";/*declare container variable*/
				player.configfile = "http://iamstellen.pw/radio/config.xml";/*declare configfile variable*/				
				player.playerType = "<?=$_GET['pt']?>";/*declare playerType variable*/
				player.autoPlay = "<?=$_GET['ap']?>";/*declare playerType variable*/
				player.playerSkin = "<?=$_GET['cs']?>";
				player.init();/*call init function in init.js file*/
			}
		</script>
	</head>
	<body>
		<div id="putinit"></div>
	</body>
</html>