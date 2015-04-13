var XMing = XMing || {};

XMing.GameStateManager = new function() {

    var gameState;
    var userData;
    var score = 0;
    var gameTimer;
    var remainingTime;
    var roundStartTime;
    var dataArray = [{
        available: ["i"],
        special: "l"
    }, {
        available: ["l"],
        special: "i"
    }, {
        available: ["O"],
        special: "0"
    }, {
        available: ["0"],
        special: "O"
    }, {
        available: ["5"],
        special: "S"
    }, {
        available: ["S"],
        special: "5"
    }, {
        available: ["p"],
        special: "q"
    }, {
        available: ["q"],
        special: "p"
    }, {
        available: ["|"],
        special: "l"
    }, {
        available: ["l"],
        special: "|"
    }, {
        available: ["8"],
        special: "3"
    }, {
        available: ["m"],
        special: "nn"
    }, {
        available: ["w"],
        special: "vv"
    }, {
        available: ["u"],
        special: "&#xB5;"
    }, {
        available: ["x"],
        special: "&#155;&#139;" // ><
    }, {
        available: ["d"],
        special: "cl"
    }, {
        available: ["O"],
        special: "Q"
    }, {
        available: ["3", "6", "8", "9", "0"],
        special: "S"
    }, {
        available: ["a", "e", "i", "o", "u"],
        special: "7"
    }, {
        available: ["S"],
        special: "&#36;" // $
    }, {
        available: [":"],
        special: ";"
    }, {
        available: ["?"],
        special: "&#191;" // inverted ?
    }, {
        available: ["&#204;"], // `i
        special: "&#205;" // i'
    }, {
        available: ["%"],
        special: "&#8453;" // c/o
    }];
    var range = _.range(_.size(dataArray));

    // declare CONSTANTS
    var VERSION_NUMBER = 1;
    var GAME_STATE_ENUM = {
        INITIAL: "initial",
        START: "start",
        PAUSE: "pause",
        END: "end"
    };

    this.setupGameNode = function() {
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
        $('html, body').scrollTop($(".panel-container").offset().top);

        remainingTime = 3.5;
        roundStartTime = new Date();

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
                    .css("color", "#11BDFF");
                $("#timer-value").removeClass("animated fadeIn");

                $("ul.game-grid li .content").each(function() {
                    if ($(this).data("special")) {
                        $(this).css("background", "#FFFBCF");
                    }
                });

                self.setupNextRound();
            } else {
                gameTimer = setTimeout(countdown, 500);
            }
        })();

        $("ul.game-grid li").click(function() {
            var roundEndTime = new Date();
            var timeGiven = 3.0;
            var timeRemained = timeGiven - (roundEndTime.getTime() - roundStartTime.getTime()) / 1000;
            var scoreChanged = Math.ceil(timeRemained * 10);

            if ($(this.firstChild).data("special")) {
                $("#result-content")
                    .html("Correct!")
                    .addClass('animated bounceIn')
                    .css("color", "#0F0");

                score += scoreChanged;
                $(".score-change")
                    .html("+" + scoreChanged)
                    .css("color", "#00E000");
            } else {
                $("#result-content")
                    .html("Wrong!")
                    .addClass('animated bounceIn')
                    .css("color", "#F00");

                $("ul.game-grid li .content").each(function() {
                    if ($(this).data("special")) {
                        $(this).css("background", "#FFFBCF");
                    }
                });

                score -= scoreChanged;
                $(".score-change")
                    .html("-" + scoreChanged)
                    .css("color", "#F00");
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
            self.setupNextRound();
        });
    };
    this.setupNextRound = function() {
        var self = this;

        var gameGrid = $("ul.game-grid");
        $("#result")
            .width(gameGrid.width())
            .height(gameGrid.height())
            .show();

        _.delay(function() {
            $("#result").hide();

            if (_.size(range) > 0) {
                self.setupGameNode();
            } else {
                self.endGame();
            }
        }, 1000);
    };

    this.preloadImage = function() {
        var imgYellowEgg = new Image();
        imgYellowEgg.src = "images/yellow-egg.png";

        var imgBlueEgg = new Image();
        imgBlueEgg.src = "images/blue-egg.png";

        var imgNinjaEgg = new Image();
        imgNinjaEgg.src = "images/ninja-egg.png";

        var imgLove = new Image();
        imgLove.src = "images/love.png";
    }
    this.onResize = function() {
        var lis = $(".game-grid").children("li");

        if (lis.length === 0) {
            return;
        }

        var liMaxWidth = _.max(lis, function(li) {
            return $(li).width();
        });
        var maxWidth = $(liMaxWidth).width();

        _.each(lis, function(li) {
            $(li).height(maxWidth);
        });
    };

    // Game status operation
    this.initGame = function() {
        var self = this;
        gameState = GAME_STATE_ENUM.INITIAL;

        window.addEventListener("resize", this.onResize.bind(this), false);

        FastClick.attach(document.body);

        this.preloadImage();

        userData = this.loadData();

        swal.setDefaults({
            confirmButtonColor: '#EAF53B'
        });

        $(".btn-play").click(function() {
            self.startGame();
        });

        $(".btn-leaderboard").click(function() {
            self.showLeaderboard();
        });

        $(".icon-back").click(function() {
            $(".panel-game").hide();
            $(".panel-leaderboard").hide();
            $(".panel-main").show();
        });

        $(".icon-repeat").click(function() {
            self.startGame();
        });

        this.checkPlayedEasterEgg();
    };
    this.startGame = function() {
        gameState = GAME_STATE_ENUM.START;
        score = 0;
        range = _.range(_.size(dataArray));

        $(".panel-main").hide();
        $(".panel-game").show();
        $("#timer").show();
        $("#replay").hide();

        $('html, body').animate({
            scrollTop: $(".panel-container").offset().top
        }, 'fast');

        this.setupGameNode();
    };
    this.endGame = function() {
        var self = this;
        gameState = GAME_STATE_ENUM.END;

        var positionSpecial = _.random(7);
        var liArray = _.times(8, function(index) {
            if (index === positionSpecial) {
                return "<li><div class='content special'>&#135;&#135;</div></li>";
            }
            return "<li><div class='content'>#</div></li>";
        });

        liArray.splice(4, 0,
            "<li><div class='content'>G</div></li>",
            "<li><div class='content'>A</div></li>",
            "<li><div class='content'>M</div></li>",
            "<li><div class='content'>E</div></li>",
            "<li><div class='content'>O</div></li>",
            "<li><div class='content'>V</div></li>",
            "<li><div class='content'>E</div></li>",
            "<li><div class='content'>R</div></li>"
        );

        $(".game-grid").html(liArray.join(''));
        $("#timer").hide();
        $("#replay").show();
        $("#score-value").html(score);
        this.onResize();
        $('html, body').scrollTop($(".panel-container").offset().top);

        swal({
            title: "Well Done!",
            text: "Your score is " + score + "! :D",
            imageUrl: "images/oo0oo.png",
            closeOnConfirm: false
        }, function() {
            var postingInProgress = false;
            swal({
                title: "Thanks for playing!!!",
                imageUrl: "images/love.png",
                type: "input",
                text: "Write your name here! It will appear in the leaderboard!",
                closeOnConfirm: false
            }, function(playerName) {
                if (playerName == "") {
                    swal.showInputError("You need to write something! A nickname is fine too!");
                    return false;
                }
                if (postingInProgress) {
                    return false;
                } else {
                    postingInProgress = true;
                    $.ajax({
                        method: "POST",
                        url: 'http://weiseng.redairship.com/leaderboard/api/1/highscore.json',
                        contentType: "application/json",
                        data: JSON.stringify({
                            game_id: 4,
                            username: playerName,
                            score: score
                        })
                    }).success(function(data) {
                        swal("Congratulations!", "You are currently ranked " + data.rank_text + "!", "success");
                    }).fail(function() {
                        swal("Oops...", "Something went wrong!", "error");
                    });
                }
            });
        });

        $(".special").click(function() {
            if (!userData.easterEgg.specialOne) {
                userData.easterEgg.specialOne = true;
                self.saveData(userData);
                swal({
                    title: 'Congratulations!',
                    text: 'You have found the Yellow Egg!',
                    imageUrl: 'images/yellow-egg.png'
                });
                $.ajax({
                    method: "POST",
                    url: 'http://weiseng.redairship.com/leaderboard/api/1/highscore.json',
                    contentType: "application/json",
                    data: JSON.stringify({
                        game_id: 11,
                        username: userData.uid,
                        score: 1
                    })
                });
            } else {
                swal({
                    title: 'Hello!',
                    text: 'You have collected the Yellow Egg already!',
                    imageUrl: 'images/yellow-egg.png'
                });
            }
        });

        if (!userData.played.specialOne) {
            userData.played.specialOne = true;
            this.saveData(userData);
        }
    };
    this.showLeaderboard = function() {
        $(".panel-main").hide();
        $(".panel-leaderboard").show();
        $('.loader').show();

        $(".highscore-list").html("");

        if (!userData.leaderboard.specialOne) {
            userData.leaderboard.specialOne = true;
            this.saveData(userData);
            this.checkLeaderboardEasterEgg();
        }

        $.get("http://weiseng.redairship.com/leaderboard/api/1/highscore.json?game_id=4", function(data) {
            $('.loader').fadeOut(700);

            var numDummyData = 10 - data.length;
            for (var i = 0; i < numDummyData; i++) {
                data.push({
                    username: '----------',
                    score: 0
                });
            }

            _.each(data, function(highscore, index) {
                setTimeout(function() {
                    $(".highscore-list").append('<li class="animated slideInUp">' + (index + 1) + ': ' + highscore.username + ' - ' + highscore.score + '</li>');
                }, index * 200);
            });
        }).fail(function() {
            swal("Oops...", "Something went wrong!", "error");
        });
    };

    // Check game state
    this.isGameStateInitial = function() {
        return gameState == GAME_STATE_ENUM.INITIAL;
    };
    this.isGameStateStart = function() {
        return gameState == GAME_STATE_ENUM.START;
    };
    this.isGameStateEnd = function() {
        return gameState == GAME_STATE_ENUM.END;
    };

    // Easter Egg
    this.checkPlayedEasterEgg = function() {
        if (!userData.easterEgg.allGames) {
            if (_.every(userData.played)) {
                userData.easterEgg.allGames = true;
                this.saveData(userData);
                swal({
                    title: 'Congratulations!',
                    text: 'You have found the Blue Egg!',
                    imageUrl: 'images/blue-egg.png'
                });
                $.ajax({
                    method: "POST",
                    url: 'http://weiseng.redairship.com/leaderboard/api/1/highscore.json',
                    contentType: "application/json",
                    data: JSON.stringify({
                        game_id: 13,
                        username: userData.uid,
                        score: 1
                    })
                });
            }
        }
    };
    this.checkLeaderboardEasterEgg = function() {
        if (!userData.easterEgg.allLeaderboard) {
            if (_.every(userData.leaderboard)) {
                userData.easterEgg.allLeaderboard = true;
                this.saveData(userData);
                swal({
                    title: 'Congratulations!',
                    text: 'You have found the Ninja Egg!',
                    imageUrl: 'images/ninja-egg.png'
                });
                $.ajax({
                    method: "POST",
                    url: 'http://weiseng.redairship.com/leaderboard/api/1/highscore.json',
                    contentType: "application/json",
                    data: JSON.stringify({
                        game_id: 15,
                        username: userData.uid,
                        score: 1
                    })
                });
            }
        }
    };

    // Local storage
    this.saveData = function(userData) {
        if (window.localStorage) {
            window.localStorage.setItem('data', btoa(encodeURIComponent(JSON.stringify(userData))));
        }
    };
    this.loadData = function() {
        if (window.localStorage) {
            var data = window.localStorage.getItem('data');
            if (data) {
                var parsedData = JSON.parse(decodeURIComponent(atob(data)));
                // make sure version is the same
                if (parsedData.version === VERSION_NUMBER) {
                    return parsedData;
                }
            }
        }

        var uid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0,
                v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });

        var data = {
            played: {
                bunny: false,
                specialOne: false,
                mushrooms: false,
                word: false,
                numbers: false,
                squirrel: false
            },
            leaderboard: {
                bunny: false,
                specialOne: false,
                mushrooms: false,
                word: false,
                numbers: false,
                squirrel: false
            },
            squirrel: {
                level: 0,
                inHallOfFame: false
            },
            easterEgg: {
                allGames: false,
                allLeaderboard: false,
                word: false,
                numbers: false,
                specialOne: false,
                mushrooms: false,
                squirrel: false
            },
            collectAll: false,
            uid: uid,
            version: VERSION_NUMBER
        };

        this.saveData(data);

        return data;
    };
};

$(function() {
    XMing.GameStateManager.initGame();
});
