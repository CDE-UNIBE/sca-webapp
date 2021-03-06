<?php echo $this->Html->docType('html5'); ?>
<html lang="en">
    <head>
        <meta charset="utf-8" content="">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="description" content="">
        <meta name="author" content="">
        <?php
        echo $this->Html->meta('icon');
        if (Configure::read("debug") == 0) {
            echo $this->Html->css(array("bootstrap-3.0.3/bootstrap.min", "font-awesome-4.0.3/font-awesome.min", "default.min"));
            echo $this->Html->script(array("jquery-1.10.2.min", "bootstrap-3.0.3/bootstrap.min"));
        } else {
            echo $this->Html->css(array("bootstrap-3.0.3/bootstrap.min.css", "font-awesome-4.0.3/font-awesome.min.css", "default"));
            echo $this->Html->script(array("jquery-1.10.2.min", "bootstrap-3.0.3/bootstrap.min"));
        }
        ?>

        <title>Spatial Context Analyst</title>

        <!-- Bootstrap core CSS -->
        <?php
        echo $this->fetch('css');
        echo $this->fetch('script');
        ?>
        <!-- Custom styles for this template -->
        <!--<link href="navbar-static-top.css" rel="stylesheet">-->

        <!-- HTML5 shim and Respond.js IE8 support of HTML5 elements and media queries -->
        <!--[if lt IE 9]>
          <script src="https://oss.maxcdn.com/libs/html5shiv/3.7.0/html5shiv.js"></script>
          <script src="https://oss.maxcdn.com/libs/respond.js/1.3.0/respond.min.js"></script>
        <![endif]-->
    </head>

    <body>

        <!-- Static navbar -->
        <div class="navbar navbar-default navbar-fixed-top" role="navigation">
            <div class="container">
                <div class="navbar-header">
                    <button type="button" class="navbar-toggle" data-toggle="collapse" data-target=".navbar-collapse">
                        <span class="sr-only">Toggle navigation</span>
                        <span class="icon-bar"></span>
                        <span class="icon-bar"></span>
                        <span class="icon-bar"></span>
                    </button>
                    <a class="logo navbar-btn pull-left" href="<?php echo $this->Html->url(array("controller" => "pages", "action" => "display", "index")); ?>" title="Home">
                        <?php /* echo $this->Html->image("unibern_logo.png", array('alt' => "Home")) */ ?>
                    </a>
                    <a class="navbar-brand" href="<?php echo $this->Html->url(array("controller" => "pages", "action" => "display", "index")); ?>">Spatial Context Analyst</a>
                </div>
                <div class="navbar-collapse collapse">
                    <ul class="nav navbar-nav">
                        <li <?php
                        if ($title_for_layout == "index") {
                            echo "class=\"active\"";
                        }
                        ?>><a href="<?php echo $this->Html->url(array("controller" => "pages", "action" => "display", "index")); ?>">Home</a></li>
                        <li <?php
                            if ($title_for_layout == "about") {
                                echo "class=\"active\"";
                            }
                        ?>><a href="<?php echo $this->Html->url(array("controller" => "pages", "action" => "display", "about")); ?>">About</a></li>
                    </ul>
                </div><!--/.nav-collapse -->
            </div>
        </div>


        <div class="container" style="margin-top: 20px;">
            <!-- Main component for a primary marketing message or call to action -->
            <?php echo $this->fetch('content'); ?>
        </div><!-- /container -->


        <!-- Bootstrap core JavaScript
        ================================================== -->
        <!-- Placed at the end of the document so the pages load faster -->

    </body>
</html>

