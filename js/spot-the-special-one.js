var XMing = XMing || {};

XMing.GameStateManager = new function() {

    var gameState;
    var score = 0;
    var gameTimer;
    var remainingTime;
    var dataArray = [{
        available: ["i"],
        special: "l"
    }, {
        available: ["O"],
        special: "0"
    }, {
        available: ["0"],
        special: "O"
    }, {
        available: ["5"],
        special: "S"
    },

        {
            available: ["p"],
            special: "q"
        }, {
            available: ["8"],
            special: "3"
        }, {
            available: ["m"],
            special: "nn"
        }, {
            available: ["w"],
            special: "vv"
        },

        {
            available: ["u"],
            special: "&#xB5;"
        }, {
            available: ["x"],
            special: "&#10008;"
        }, {
            available: ["d"],
            special: "cl"
        }, {
            available: ["O"],
            special: "Q"
        },

        {
            available: ["3", "6", "8", "9", "0"],
            special: "S"
        }, {
            available: ["a", "e", "i", "o", "u"],
            special: "n"
        }, {
            available: ["v", "w", "x", "y", "z"],
            special: "u"
        }, {
            available: ["V", "W", "X", "Y"],
            special: "M"
        }
    ];
    var range = _.range(_.size(dataArray));

    // declare CONSTANTS
    var GAME_STATE_ENUM = {
        INITIAL: "initial",
        START: "start",
        PAUSE: "pause",
        END: "end"
    };

    this.init = function() {
        window.addEventListener("resize", this.onResize.bind(this), false);
        this.initGame();
    };

    this.loadData = function() {
        var self = this;

        var index = _.sample(range);
        range = _.without(range, index);

        var data = dataArray[index];
        var numTimes = Math.ceil(15 / _.size(data.available));

        var availableArray = [];
        _.times(numTimes, function() {
            availableArray = availableArray.concat(data.available);
        });

        availableArray = _.sample(availableArray, 15);

        var htmlArray = [];
        _.each(availableArray, function(available) {
            htmlArray.push("<li><div class='content animated fadeIn'>" + available + "</div></li>");
        });
        htmlArray.push("<li><div class='content animated fadeIn' data-special='true'>" + data.special + "</div></li>");
        htmlArray = _.shuffle(htmlArray);

        $(".game-grid").html("");
        _.each(htmlArray, function(html) {
            $(".game-grid").append(html);
        });
        this.onResize();
        $('html, body').scrollTop($("#panel-container").offset().top);

        remainingTime = 3.5;

        (function countdown() {
            remainingTime -= 0.5;
            $("#timer-value").html(Math.ceil(remainingTime));
            $("#timer-value").addClass("animated fadeIn");
            $("#score-value").html(score);

            if (remainingTime <= 0) {
                clearTimeout(gameTimer);

                $("#result-content")
                    .html("Time's up!")
                    .addClass('animated bounceIn')
                    .css("color", "rgba(17, 189, 255, 255)");
                $("#timer-value").removeClass("animated fadeIn");

                self.loadNextRound();
            } else {
                gameTimer = setTimeout(countdown, 500);
            }
        })();

        $("ul.game-grid li").click(function() {

            if ($(this.firstChild).data("special")) {
                $("#result-content")
                    .html("Correct!")
                    .addClass('animated bounceIn')
                    .css("color", "rgba(0, 255, 0, 255)");

                score += remainingTime * 10;
                $(".score-change")
                    .html("+" + remainingTime * 10)
                    .css("color", "rgba(0, 255, 0, 255)");;
            } else {
                $("#result-content")
                    .html("Wrong!")
                    .addClass('animated bounceIn')
                    .css("color", "rgba(255, 0, 0, 255)");

                score -= remainingTime * 10;
                $(".score-change")
                    .html("-" + remainingTime * 10)
                    .css("color", "rgba(255, 0, 0, 255)");
            }

            $("#timer-value").removeClass("animated fadeIn");
            $("#score-value").html(score);
            $(".score-change").animate({
                top: '-25px'
            }, {
                duration: 1000,
                complete: function() {
                    $(".score-change")
                        .html("")
                        .css("top", "-10px");
                }
            });
            clearTimeout(gameTimer);
            self.loadNextRound();
        });
    };

    this.loadNextRound = function() {
        var self = this;

        var gameGrid = $("ul.game-grid");
        $("#result")
            .width(gameGrid.width())
            .height(gameGrid.height())
            .show();

        _.delay(function() {
            $("#result").hide();

            if (_.size(range) > 0) {
                self.loadData();
            } else {
                self.endGame();
            }
        }, 1000);
    };

    this.onResize = function(event) {
        var lis = $(".game-grid").children("li");

        var liMaxWidth = _.max(lis, function(li) {
            return $(li).width();
        });
        var maxWidth = $(liMaxWidth).width();

        _.each(lis, function(li) {
            $(li).height(maxWidth);
        });
    };

    // game status operation
    this.initGame = function() {
        gameState = GAME_STATE_ENUM.INITIAL;

        var self = this;
        $(".icon-repeat").click(function() {
            self.startGame();
        });
    };

    this.startGame = function() {
        gameState = GAME_STATE_ENUM.START;
        score = 0;
        range = _.range(_.size(dataArray));
        $("#timer").show();
        $("#replay").hide();

        this.loadData();
    };

    this.endGame = function() {
        gameState = GAME_STATE_ENUM.END;

        var html = "<li><div class='content'>#</div></li>";
        html += "<li><div class='content'>#</div></li>";
        html += "<li><div class='content'>#</div></li>";
        html += "<li><div class='content'>#</div></li>";

        html += "<li><div class='content'>G</div></li>";
        html += "<li><div class='content'>A</div></li>";
        html += "<li><div class='content'>M</div></li>";
        html += "<li><div class='content'>E</div></li>";

        html += "<li><div class='content'>O</div></li>";
        html += "<li><div class='content'>V</div></li>";
        html += "<li><div class='content'>E</div></li>";
        html += "<li><div class='content'>R</div></li>";

        html += "<li><div class='content'>#</div></li>";
        html += "<li><div class='content'>#</div></li>";
        html += "<li><div class='content'>#</div></li>";
        html += "<li><div class='content'>#</div></li>";

        $(".game-grid").html(html);
        $("#timer").hide();
        $("#replay").show();
        $("#score-value").html(score);
        this.onResize();
        $('html, body').scrollTop($("#panel-container").offset().top);

        alert('Congratulations!\rYour score is ' + score + '!\rThanks for playing!');
    };

    // check game state
    this.isGameStateInitial = function() {
        return gameState == GAME_STATE_ENUM.INITIAL;
    };

    this.isGameStateStart = function() {
        return gameState == GAME_STATE_ENUM.START;
    };

    this.isGameStateEnd = function() {
        return gameState == GAME_STATE_ENUM.END;
    };
};