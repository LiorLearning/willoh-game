function _class_call_check(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
    }
}
function _defineProperties(target, props) {
    for(var i = 0; i < props.length; i++){
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
    }
}
function _create_class(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
}
import { CANVAS_WIDTH, CANVAS_HEIGHT, GAME_STATE } from './constants.js';
import { FloatingText } from './FloatingText.js';

var QuizPanel = /*#__PURE__*/ function() {
    "use strict";
    function QuizPanel(game) {
        _class_call_check(this, QuizPanel);
        this.game = game;
        this.visible = false;
        this.fadeIn = 0;
        this.lastTime = Date.now();
        this.answered = false; // Add flag to track if an answer has been selected
        
        // Panel dimensions
        this.width = 360;
        this.height = 280;
        this.x = CANVAS_WIDTH / 2 - this.width / 2;
        this.y = CANVAS_HEIGHT / 2 - this.height / 2;
        
        // Quiz content
        this.currentQuiz = null;
        this.selectedAnswer = null;
        this.feedbackMessage = '';
        this.feedbackColor = 'white';
        this.showingFeedback = false;
        this.feedbackTimer = 0;
        this.buttonAnimations = [0, 0, 0, 0];
        this.currentStage = 1; // Track which stage of the quiz we're on
        this.currentMultiplication = null; // Store the current multiplication problem

        // Quiz question bank - multiplication as repeated addition
        this.quizQuestions = [
            {
                firstNumber: 4,
                secondNumber: 5,
                repeatedAddition: "4+4+4+4+4",
                answer: 20
            },
            {
                firstNumber: 3,
                secondNumber: 6,
                repeatedAddition: "3+3+3+3+3+3",
                answer: 18
            },
            {
                firstNumber: 5,
                secondNumber: 4,
                repeatedAddition: "5+5+5+5",
                answer: 20
            },
            {
                firstNumber: 6,
                secondNumber: 3,
                repeatedAddition: "6+6+6",
                answer: 18
            },
            {
                firstNumber: 7,
                secondNumber: 2,
                repeatedAddition: "7+7",
                answer: 14
            }
        ];
        this.setupListeners();
    }
    _create_class(QuizPanel, [
        {
            key: "setupListeners",
            value: function setupListeners() {
                this.mouseMoveHandler = this.handleMouseMove.bind(this);
                this.clickHandler = this.handleClick.bind(this);
                this.touchHandler = this.handleTouch.bind(this);
                
                this.game.canvas.addEventListener('mousemove', this.mouseMoveHandler);
                this.game.canvas.addEventListener('click', this.clickHandler);
                this.game.canvas.addEventListener('touchstart', this.touchHandler);
            }
        },
        {
            key: "removeListeners",
            value: function removeListeners() {
                this.game.canvas.removeEventListener('mousemove', this.mouseMoveHandler);
                this.game.canvas.removeEventListener('click', this.clickHandler);
                this.game.canvas.removeEventListener('touchstart', this.touchHandler);
            }
        },
        {
            key: "handleMouseMove",
            value: function handleMouseMove(event) {
                if (!this.visible) return;
                const rect = this.game.canvas.getBoundingClientRect();
                const mouseX = (event.clientX - rect.left) * (this.game.canvas.width / rect.width);
                const mouseY = (event.clientY - rect.top) * (this.game.canvas.height / rect.height);

                // Check button hover states
                if (this.currentQuiz) {
                    const buttonHeight = 40;
                    const buttonSpacing = 12;
                    const startY = this.y + 120;

                    for (let i = 0; i < this.currentQuiz.answers.length; i++) {
                        const buttonY = startY + i * (buttonHeight + buttonSpacing);
                        const isHovered = mouseX >= this.x + 30 && 
                                        mouseX <= this.x + this.width - 30 && 
                                        mouseY >= buttonY && 
                                        mouseY <= buttonY + buttonHeight;
                        
                        // Update button animation
                        if (isHovered && this.buttonAnimations[i] < 1) {
                            this.buttonAnimations[i] = Math.min(1, this.buttonAnimations[i] + 0.1);
                        } else if (!isHovered && this.buttonAnimations[i] > 0) {
                            this.buttonAnimations[i] = Math.max(0, this.buttonAnimations[i] - 0.1);
                        }
                    }
                }
            }
        },
        {
            key: "handleClick",
            value: function handleClick(event) {
                if (!this.visible || this.answered) return; // Don't handle clicks if already answered
                const rect = this.game.canvas.getBoundingClientRect();
                const mouseX = (event.clientX - rect.left) * (this.game.canvas.width / rect.width);
                const mouseY = (event.clientY - rect.top) * (this.game.canvas.height / rect.height);

                if (this.currentQuiz) {
                    const buttonHeight = 40;
                    const buttonSpacing = 12;
                    const startY = this.y + 120;

                    for (let i = 0; i < this.currentQuiz.answers.length; i++) {
                        const buttonY = startY + i * (buttonHeight + buttonSpacing);
                        if (mouseX >= this.x + 30 && 
                            mouseX <= this.x + this.width - 30 && 
                            mouseY >= buttonY && 
                            mouseY <= buttonY + buttonHeight) {
                            this.answered = true; // Set answered flag
                            this.selectedAnswer = i;
                            this.checkAnswer();
                            break;
                        }
                    }
                }
            }
        },
        {
            key: "handleTouch",
            value: function handleTouch(event) {
                if (!this.visible || this.answered) return; // Don't handle touches if already answered
                event.preventDefault();
                const rect = this.game.canvas.getBoundingClientRect();
                const touch = event.touches[0];
                const touchX = (touch.clientX - rect.left) * (this.game.canvas.width / rect.width);
                const touchY = (touch.clientY - rect.top) * (this.game.canvas.height / rect.height);

                if (this.currentQuiz) {
                    const buttonHeight = 40;
                    const buttonSpacing = 12;
                    const startY = this.y + 120;

                    for (let i = 0; i < this.currentQuiz.answers.length; i++) {
                        const buttonY = startY + i * (buttonHeight + buttonSpacing);
                        if (touchX >= this.x + 30 && 
                            touchX <= this.x + this.width - 30 && 
                            touchY >= buttonY && 
                            touchY <= buttonY + buttonHeight) {
                            this.answered = true; // Set answered flag
                            this.selectedAnswer = i;
                            this.checkAnswer();
                            break;
                        }
                    }
                }
            }
        },
        {
            key: "show",
            value: function show(miningSpot) {
                this.visible = true;
                this.fadeIn = 0;
                this.lastTime = Date.now();
                this.selectRandomQuiz();
                this.selectedAnswer = null;
                this.showingFeedback = false;
                this.currentMiningSpot = miningSpot;
                this.buttonAnimations = [0, 0, 0, 0];
                this.answered = false; // Reset answered flag when showing new quiz
            }
        },
        {
            key: "hide",
            value: function hide() {
                this.visible = false;
                this.currentQuiz = null;
                this.selectedAnswer = null;
                this.answered = false; // Reset answered flag when hiding
            }
        },
        {
            key: "selectRandomQuiz",
            value: function selectRandomQuiz() {
                // Select a random multiplication problem
                var randomIndex = Math.floor(Math.random() * this.quizQuestions.length);
                this.currentMultiplication = this.quizQuestions[randomIndex];
                this.currentStage = 1;
                this.answered = false;
                this.selectedAnswer = null;
                this.showingFeedback = false;
                
                // Set up the first stage question
                this.currentQuiz = {
                    question: `How can we write ${this.currentMultiplication.firstNumber} × ${this.currentMultiplication.secondNumber}?`,
                    answers: [
                        this.currentMultiplication.repeatedAddition,
                        this.generateWrongRepeatedAddition(this.currentMultiplication),
                        this.generateWrongRepeatedAddition(this.currentMultiplication),
                        this.generateWrongRepeatedAddition(this.currentMultiplication)
                    ],
                    correctAnswer: 0,
                    reward: {
                        type: "goldNuggets",
                        amount: 6
                    }
                };
            }
        },
        {
            key: "checkAnswer",
            value: function checkAnswer() {
                var _this = this;
                if (this.selectedAnswer === this.currentQuiz.correctAnswer) {
                    if (this.currentStage === 1) {
                        // Move to stage 2
                        this.currentStage = 2;
                        this.answered = false;
                        this.selectedAnswer = null;
                        this.showingFeedback = false;
                        
                        // Set up the second stage question
                        this.currentQuiz = {
                            question: `What is ${this.currentMultiplication.repeatedAddition}?`,
                            answers: [
                                this.currentMultiplication.answer.toString(),
                                (this.currentMultiplication.answer + 5).toString(),
                                (this.currentMultiplication.answer - 3).toString(),
                                (this.currentMultiplication.answer + 2).toString()
                            ],
                            correctAnswer: 0,
                            reward: this.currentQuiz.reward
                        };
                        return;
                    }
                    
                    // Correct answer in stage 2
                    this.feedbackMessage = 'Correct! Resource collected.';
                    this.feedbackColor = '#4CAF50'; // Green
                    
                    // If this quiz is from a mining spot, award the resource
                    if (this.currentMiningSpot) {
                        // Determine which resource to award based on probability
                        // Tulip: 1/4, Grape: 1/4, Cactus: 2/4
                        let resourceType;
                        const randomValue = Math.random();
                        
                        if (randomValue < 1/4) {
                            resourceType = 'tulip';
                        } else if (randomValue < 2/4) {
                            resourceType = 'grape';
                        } else {
                            resourceType = 'cactus';
                        }
                        
                        // Add the resource to the game
                        this.game.resourceManager.addResource(resourceType, 1);
                        this.game.craftingPanel.updateResources(this.game.resourceManager.getResources());
                        
                        // Add floating text
                        this.game.floatingTexts.push(new FloatingText(`+1 ${resourceType}`, this.currentMiningSpot.x, this.currentMiningSpot.y - 20));
                        
                        // Mark the mining spot as completed
                        this.currentMiningSpot.quizCompleted = true;
                        this.currentMiningSpot.resourceSpawned = true;
                        
                        // Play success sound
                        this.game.audioManager.play('collect', 1.0);
                    } else {
                        // Fallback for quizzes not triggered by mining
                        this.game.resourceManager.addResource(this.currentQuiz.reward.type, this.currentQuiz.reward.amount);
                        this.game.craftingPanel.updateResources(this.game.resourceManager.getResources());
                        
                        // Add floating text for direct rewards
                        var playerX = this.game.player.x;
                        var playerY = this.game.player.y;
                        this.game.floatingTexts.push(new FloatingText("+".concat(this.currentQuiz.reward.amount, " ").concat(this.currentQuiz.reward.type), playerX, playerY - 20));
                    }
                } else {
                    // Wrong answer
                    this.feedbackMessage = 'Incorrect! Try again.';
                    this.feedbackColor = '#F44336'; // Red
                }
                
                // Show feedback
                this.showingFeedback = true;
                this.feedbackTimer = 2000; // 2 seconds
                
                // After feedback, close quiz and return to game
                setTimeout(function() {
                    _this.hide();
                    _this.game.gameState = GAME_STATE.PLAYING;
                }, this.feedbackTimer);
            }
        },
        {
            key: "update",
            value: function update(deltaTime) {
                if (this.showingFeedback) {
                    this.feedbackTimer -= deltaTime;
                    if (this.feedbackTimer <= 0) {
                        this.showingFeedback = false;
                    }
                }
            }
        },
        {
            key: "render",
            value: function render(ctx) {
                if (!this.visible || !this.currentQuiz) return;

                const currentTime = Date.now();
                const deltaTime = (currentTime - this.lastTime) / 1000;
                this.lastTime = currentTime;
                
                // Update fade in
                this.fadeIn = Math.min(1, this.fadeIn + deltaTime * 2);

                const time = currentTime / 1000;

                ctx.save();

                // Semi-transparent overlay with fade
                ctx.fillStyle = `rgba(0, 0, 0, ${0.5 * this.fadeIn})`;
                ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

                // Panel shadow
                ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
                ctx.fillRect(this.x + 4, this.y + 4, this.width, this.height);

                // Panel background
                ctx.fillStyle = `rgba(28, 28, 28, ${0.95 * this.fadeIn})`;
                ctx.fillRect(this.x, this.y, this.width, this.height);

                // Panel border
                this.drawPixelBorder(ctx, this.x, this.y, this.width, this.height, '#B84015');

                // Inner panel accent
                ctx.fillStyle = '#B84015';
                ctx.fillRect(this.x + 12, this.y + 70, this.width - 24, 2);

                // Title with pixel shadow
                ctx.font = 'bold 20px "Press Start 2P", monospace';
                ctx.textAlign = 'center';
                ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
                ctx.fillText('Question', this.x + this.width/2 + 1, this.y + 41);
                ctx.fillStyle = '#FFFFFF';
                ctx.fillText('Question', this.x + this.width/2, this.y + 40);

                // Question text with pixel shadow
                ctx.font = '16px "Press Start 2P", monospace';
                ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
                ctx.fillText(this.currentQuiz.question, this.x + this.width/2 + 1, this.y + 91);
                ctx.fillStyle = '#E0E0E0';
                ctx.fillText(this.currentQuiz.question, this.x + this.width/2, this.y + 90);

                // Render answer buttons
                const buttonHeight = 40;
                const buttonSpacing = 12;
                const startY = this.y + 120;
                const buttonWidth = this.width - 60;

                this.currentQuiz.answers.forEach((answer, index) => {
                    const buttonY = startY + index * (buttonHeight + buttonSpacing);
                    this.renderButton(
                        ctx,
                        `${index + 1}. ${answer}`,
                        this.x + 30,
                        buttonY,
                        buttonWidth,
                        buttonHeight,
                        index,
                        time
                    );
                });

                // Render feedback if showing
                if (this.showingFeedback) {
                    const feedbackY = startY + this.currentQuiz.answers.length * (buttonHeight + buttonSpacing) + 20;
                    
                    ctx.font = '16px "Press Start 2P", monospace';
                    ctx.textAlign = 'center';
                    ctx.fillStyle = this.feedbackColor;
                    ctx.fillText(this.feedbackMessage, this.x + this.width/2, feedbackY);
                }

                ctx.restore();
            }
        },
        {
            // Helper function to draw pixelated border
            key: "drawPixelBorder",
            value: function drawPixelBorder(ctx, x, y, width, height, color) {
                ctx.fillStyle = color;
                // Top border
                ctx.fillRect(x + 2, y, width - 4, 2);
                // Bottom border
                ctx.fillRect(x + 2, y + height - 2, width - 4, 2);
                // Left border
                ctx.fillRect(x, y + 2, 2, height - 4);
                // Right border
                ctx.fillRect(x + width - 2, y + 2, 2, height - 4);
                // Corners
                ctx.fillRect(x + 1, y + 1, 2, 2);
                ctx.fillRect(x + width - 3, y + 1, 2, 2);
                ctx.fillRect(x + 1, y + height - 3, 2, 2);
                ctx.fillRect(x + width - 3, y + height - 3, 2, 2);
            }
        },
        {
            // Helper function to render button
            key: "renderButton",
            value: function renderButton(ctx, text, x, y, width, height, index, time) {
                // Button shadow
                ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
                ctx.fillRect(x + 2, y + 2, width, height);

                // Button background
                const baseColor = this.buttonAnimations[index] > 0 ? '#3F3F3F' : '#2A2A2A';
                ctx.fillStyle = baseColor;
                ctx.fillRect(x, y, width, height);

                // Pixel border
                const borderColor = this.buttonAnimations[index] > 0 ? '#FF6B45' : '#4A4A4A';
                this.drawPixelBorder(ctx, x, y, width, height, borderColor);

                // Button text with pixel shadow
                const textY = y + height/2;
                const bounceOffset = this.buttonAnimations[index] * Math.sin(time * 8) * 1.5;
                
                // Text shadow
                ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
                ctx.font = '16px "Press Start 2P", monospace';
                ctx.textAlign = 'left';
                ctx.textBaseline = 'middle';
                ctx.fillText(text, x + 13, textY + 1 + bounceOffset);

                // Main text
                ctx.fillStyle = this.buttonAnimations[index] > 0 ? '#FFFFFF' : '#BBBBBB';
                ctx.fillText(text, x + 12, textY + bounceOffset);
            }
        },
        {
            // Helper function to generate wrong repeated addition options
            key: "generateWrongRepeatedAddition",
            value: function generateWrongRepeatedAddition(multiplication) {
                const firstNum = multiplication.firstNumber;
                const secondNum = multiplication.secondNumber;
                
                // Generate different wrong patterns
                const patterns = [
                    // Wrong number of additions
                    Array(secondNum - 1).fill(firstNum).join('+'),
                    // Wrong number being added
                    Array(secondNum).fill(firstNum + 1).join('+'),
                    // Mixed numbers
                    Array(secondNum).fill(firstNum).map((n, i) => n + (i % 2)).join('+')
                ];
                
                return patterns[Math.floor(Math.random() * patterns.length)];
            }
        }
    ]);
    return QuizPanel;
}();
export { QuizPanel as default };
