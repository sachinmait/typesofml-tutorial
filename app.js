// Machine Learning Tutorial Interactive Application

class MLTutorial {
    constructor() {
        this.init();
    }

    init() {
        this.setupNavigation();
        this.setupSupervisedDemo();
        this.setupUnsupervisedDemo();
        this.setupReinforcementDemo();
        this.setupScrollHandling();
    }

    setupNavigation() {
        // Smooth scrolling for navigation links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    const offsetTop = targetElement.offsetTop - 100; // Account for fixed nav
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    setupScrollHandling() {
        // Highlight active navigation item based on scroll position
        const sections = document.querySelectorAll('.section');
        const navLinks = document.querySelectorAll('.nav-link');

        window.addEventListener('scroll', () => {
            let current = '';
            sections.forEach(section => {
                const sectionTop = section.offsetTop - 150;
                const sectionHeight = section.clientHeight;
                if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                    current = section.getAttribute('id');
                }
            });

            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${current}`) {
                    link.classList.add('active');
                }
            });
        });
    }

    setupSupervisedDemo() {
        const canvas = document.getElementById('supervised-canvas');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const trainingSizeSlider = document.getElementById('training-size');
        const noiseLevelSlider = document.getElementById('noise-level');
        const trainButton = document.getElementById('train-classifier');
        const resetButton = document.getElementById('reset-classifier');

        let trainingData = [];
        let testData = [];
        let decisionBoundary = null;
        let isTraining = false;

        // Generate sample data
        const generateData = (size, noise) => {
            const data = [];
            for (let i = 0; i < size; i++) {
                const x = Math.random() * 350 + 25;
                const y = Math.random() * 250 + 25;
                const noiseX = (Math.random() - 0.5) * noise * 2;
                const noiseY = (Math.random() - 0.5) * noise * 2;
                
                // Simple classification: above or below diagonal line with some variation
                const baseLabel = (y + noiseY) > (x + noiseX) ? 1 : 0;
                // Add some randomness to make it more realistic
                const label = Math.random() < 0.9 ? baseLabel : 1 - baseLabel;
                data.push({ 
                    x: Math.max(10, Math.min(canvas.width - 10, x + noiseX)), 
                    y: Math.max(10, Math.min(canvas.height - 10, y + noiseY)), 
                    label 
                });
            }
            return data;
        };

        // Draw data points
        const drawDataPoints = (data, isTest = false) => {
            data.forEach(point => {
                ctx.beginPath();
                ctx.arc(point.x, point.y, isTest ? 6 : 5, 0, 2 * Math.PI);
                if (isTest) {
                    ctx.fillStyle = point.label === 1 ? '#81C784' : '#FFAB91';
                } else {
                    ctx.fillStyle = point.label === 1 ? '#2196F3' : '#FF5722';
                }
                ctx.fill();
                ctx.strokeStyle = '#333';
                ctx.lineWidth = 1;
                ctx.stroke();
            });
        };

        // Draw decision boundary
        const drawDecisionBoundary = () => {
            if (!decisionBoundary) return;
            
            ctx.beginPath();
            ctx.moveTo(0, decisionBoundary.y1);
            ctx.lineTo(canvas.width, decisionBoundary.y2);
            ctx.strokeStyle = '#4CAF50';
            ctx.lineWidth = 3;
            ctx.stroke();
            
            // Add boundary label
            ctx.fillStyle = '#4CAF50';
            ctx.font = '12px Arial';
            ctx.fillText('Decision Boundary', 10, decisionBoundary.y1 + 15);
        };

        // Simple linear classifier
        const trainClassifier = (data) => {
            let m = -1; // slope
            let b = 200; // intercept
            
            // Simple optimization to find decision boundary
            for (let epoch = 0; epoch < 50; epoch++) {
                let errorSum = 0;
                data.forEach(point => {
                    const prediction = point.y < (m * point.x + b) ? 1 : 0;
                    const error = point.label - prediction;
                    errorSum += Math.abs(error);
                    
                    if (error !== 0) {
                        const learningRate = 0.001;
                        m += learningRate * error * point.x * 0.001;
                        b += learningRate * error;
                    }
                });
                
                if (errorSum < data.length * 0.15) break;
            }
            
            return {
                y1: Math.max(0, Math.min(canvas.height, m * 0 + b)),
                y2: Math.max(0, Math.min(canvas.height, m * canvas.width + b))
            };
        };

        // Render the demo
        const render = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Draw background
            ctx.fillStyle = '#fafafa';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Draw grid
            ctx.strokeStyle = '#e0e0e0';
            ctx.lineWidth = 1;
            for (let i = 0; i < canvas.width; i += 40) {
                ctx.beginPath();
                ctx.moveTo(i, 0);
                ctx.lineTo(i, canvas.height);
                ctx.stroke();
            }
            for (let i = 0; i < canvas.height; i += 40) {
                ctx.beginPath();
                ctx.moveTo(0, i);
                ctx.lineTo(canvas.width, i);
                ctx.stroke();
            }

            // Draw decision boundary first (behind points)
            drawDecisionBoundary();
            
            // Draw data points
            drawDataPoints(trainingData, false);
            drawDataPoints(testData, true);

            // Draw legend
            ctx.fillStyle = '#333';
            ctx.font = '11px Arial';
            ctx.fillText('Training: Blue/Red circles', 10, canvas.height - 40);
            ctx.fillText('Test: Green/Orange circles', 10, canvas.height - 25);
            ctx.fillText('Green line: Decision boundary', 10, canvas.height - 10);
        };

        // Update slider values
        trainingSizeSlider.addEventListener('input', (e) => {
            document.getElementById('training-size-value').textContent = e.target.value;
        });

        noiseLevelSlider.addEventListener('input', (e) => {
            document.getElementById('noise-level-value').textContent = e.target.value + '%';
        });

        // Train button
        trainButton.addEventListener('click', () => {
            if (isTraining) return;
            
            isTraining = true;
            trainButton.textContent = 'Training...';
            trainButton.disabled = true;
            
            setTimeout(() => {
                const trainingSize = parseInt(trainingSizeSlider.value);
                const noiseLevel = parseInt(noiseLevelSlider.value);
                
                trainingData = generateData(trainingSize, noiseLevel);
                testData = generateData(15, noiseLevel);
                decisionBoundary = trainClassifier(trainingData);
                
                render();
                
                isTraining = false;
                trainButton.textContent = 'Train Classifier';
                trainButton.disabled = false;
            }, 800);
        });

        // Reset button
        resetButton.addEventListener('click', () => {
            trainingData = [];
            testData = [];
            decisionBoundary = null;
            render();
        });

        // Generate initial data
        trainingData = generateData(30, 10);
        testData = generateData(10, 10);
        
        // Initial render
        render();
    }

    setupUnsupervisedDemo() {
        const canvas = document.getElementById('unsupervised-canvas');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const clustersSlider = document.getElementById('num-clusters');
        const dataPointsSlider = document.getElementById('data-points');
        const runButton = document.getElementById('run-clustering');
        const resetButton = document.getElementById('reset-clustering');

        let dataPoints = [];
        let centroids = [];
        let isRunning = false;
        let animationStep = 0;

        // Generate random data points with natural clustering
        const generateDataPoints = (count) => {
            const points = [];
            const clusterCenters = [
                { x: 80, y: 80 },
                { x: 320, y: 80 },
                { x: 200, y: 220 },
                { x: 100, y: 200 },
                { x: 300, y: 200 }
            ];

            for (let i = 0; i < count; i++) {
                const center = clusterCenters[Math.floor(Math.random() * Math.min(3, clusterCenters.length))];
                const angle = Math.random() * 2 * Math.PI;
                const radius = Math.random() * 60 + 10;
                const x = center.x + Math.cos(angle) * radius;
                const y = center.y + Math.sin(angle) * radius;
                
                points.push({
                    x: Math.max(15, Math.min(canvas.width - 15, x)),
                    y: Math.max(15, Math.min(canvas.height - 15, y)),
                    cluster: -1
                });
            }
            return points;
        };

        // K-means clustering step
        const kMeansStep = (k) => {
            // Initialize centroids randomly if not set
            if (centroids.length === 0) {
                for (let i = 0; i < k; i++) {
                    centroids.push({
                        x: Math.random() * (canvas.width - 40) + 20,
                        y: Math.random() * (canvas.height - 40) + 20
                    });
                }
                return false; // Not converged yet
            }

            // Assign points to nearest centroid
            let changed = false;
            dataPoints.forEach(point => {
                let minDistance = Infinity;
                let closestCentroid = 0;
                
                centroids.forEach((centroid, index) => {
                    const distance = Math.sqrt(
                        Math.pow(point.x - centroid.x, 2) + 
                        Math.pow(point.y - centroid.y, 2)
                    );
                    if (distance < minDistance) {
                        minDistance = distance;
                        closestCentroid = index;
                    }
                });
                
                if (point.cluster !== closestCentroid) {
                    changed = true;
                    point.cluster = closestCentroid;
                }
            });

            // Update centroids
            const newCentroids = [];
            for (let i = 0; i < k; i++) {
                const clusterPoints = dataPoints.filter(p => p.cluster === i);
                if (clusterPoints.length > 0) {
                    const avgX = clusterPoints.reduce((sum, p) => sum + p.x, 0) / clusterPoints.length;
                    const avgY = clusterPoints.reduce((sum, p) => sum + p.y, 0) / clusterPoints.length;
                    newCentroids.push({ x: avgX, y: avgY });
                } else {
                    newCentroids.push({ 
                        x: Math.random() * (canvas.width - 40) + 20,
                        y: Math.random() * (canvas.height - 40) + 20
                    });
                }
            }
            
            centroids = newCentroids;
            return !changed; // Converged if no changes
        };

        // Render the clustering
        const render = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Draw background
            ctx.fillStyle = '#fafafa';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Draw grid
            ctx.strokeStyle = '#e0e0e0';
            ctx.lineWidth = 1;
            for (let i = 0; i < canvas.width; i += 40) {
                ctx.beginPath();
                ctx.moveTo(i, 0);
                ctx.lineTo(i, canvas.height);
                ctx.stroke();
            }
            for (let i = 0; i < canvas.height; i += 40) {
                ctx.beginPath();
                ctx.moveTo(0, i);
                ctx.lineTo(canvas.width, i);
                ctx.stroke();
            }

            // Colors for clusters
            const colors = ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', '#5D878F', '#DB4545'];
            
            // Draw connections from points to centroids
            if (centroids.length > 0) {
                ctx.strokeStyle = '#ddd';
                ctx.lineWidth = 1;
                dataPoints.forEach(point => {
                    if (point.cluster >= 0 && centroids[point.cluster]) {
                        ctx.beginPath();
                        ctx.moveTo(point.x, point.y);
                        ctx.lineTo(centroids[point.cluster].x, centroids[point.cluster].y);
                        ctx.stroke();
                    }
                });
            }
            
            // Draw data points
            dataPoints.forEach(point => {
                ctx.beginPath();
                ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI);
                ctx.fillStyle = point.cluster >= 0 ? colors[point.cluster % colors.length] : '#999';
                ctx.fill();
                ctx.strokeStyle = '#333';
                ctx.lineWidth = 1;
                ctx.stroke();
            });

            // Draw centroids
            centroids.forEach((centroid, index) => {
                // Draw larger circle for centroid
                ctx.beginPath();
                ctx.arc(centroid.x, centroid.y, 10, 0, 2 * Math.PI);
                ctx.fillStyle = colors[index % colors.length];
                ctx.fill();
                ctx.strokeStyle = '#000';
                ctx.lineWidth = 2;
                ctx.stroke();
                
                // Draw X mark
                ctx.beginPath();
                ctx.moveTo(centroid.x - 5, centroid.y - 5);
                ctx.lineTo(centroid.x + 5, centroid.y + 5);
                ctx.moveTo(centroid.x + 5, centroid.y - 5);
                ctx.lineTo(centroid.x - 5, centroid.y + 5);
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 2;
                ctx.stroke();
            });

            // Draw legend
            ctx.fillStyle = '#333';
            ctx.font = '11px Arial';
            ctx.fillText('Small circles: Data points', 10, canvas.height - 25);
            ctx.fillText('Large circles with X: Centroids', 10, canvas.height - 10);
        };

        // Update slider values
        clustersSlider.addEventListener('input', (e) => {
            document.getElementById('num-clusters-value').textContent = e.target.value;
        });

        dataPointsSlider.addEventListener('input', (e) => {
            document.getElementById('data-points-value').textContent = e.target.value;
        });

        // Run clustering
        runButton.addEventListener('click', () => {
            if (isRunning) return;
            
            isRunning = true;
            runButton.textContent = 'Running...';
            runButton.disabled = true;
            
            const k = parseInt(clustersSlider.value);
            const numPoints = parseInt(dataPointsSlider.value);
            
            dataPoints = generateDataPoints(numPoints);
            centroids = [];
            animationStep = 0;
            
            // Animate clustering process
            const animate = () => {
                const converged = kMeansStep(k);
                render();
                
                animationStep++;
                if (!converged && animationStep < 15) {
                    setTimeout(animate, 600);
                } else {
                    isRunning = false;
                    runButton.textContent = 'Run K-means';
                    runButton.disabled = false;
                }
            };
            
            animate();
        });

        // Reset clustering
        resetButton.addEventListener('click', () => {
            dataPoints = [];
            centroids = [];
            animationStep = 0;
            render();
        });

        // Generate initial data
        dataPoints = generateDataPoints(60);
        
        // Initial render
        render();
    }

    setupReinforcementDemo() {
        const canvas = document.getElementById('reinforcement-canvas');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const learningRateSlider = document.getElementById('learning-rate');
        const episodesSlider = document.getElementById('episodes');
        const startButton = document.getElementById('start-rl');
        const resetButton = document.getElementById('reset-rl');
        const episodeDisplay = document.getElementById('current-episode');
        const rewardDisplay = document.getElementById('total-reward');

        let gridSize = 8;
        let cellSize = Math.min(canvas.width, canvas.height) / gridSize;
        let agent = { x: 0, y: 0 };
        let goal = { x: 7, y: 7 };
        let obstacles = [
            { x: 2, y: 2 }, { x: 2, y: 3 }, { x: 3, y: 2 },
            { x: 5, y: 1 }, { x: 5, y: 2 }, { x: 6, y: 2 },
            { x: 1, y: 5 }, { x: 2, y: 5 }, { x: 3, y: 5 },
            { x: 5, y: 6 }, { x: 6, y: 5 }
        ];
        let qTable = {};
        let isLearning = false;
        let currentEpisode = 0;
        let totalReward = 0;
        let bestPath = [];

        // Initialize Q-table
        const initQTable = () => {
            qTable = {};
            for (let x = 0; x < gridSize; x++) {
                for (let y = 0; y < gridSize; y++) {
                    const state = `${x},${y}`;
                    qTable[state] = {
                        up: 0,
                        down: 0,
                        left: 0,
                        right: 0
                    };
                }
            }
        };

        // Get reward for a state
        const getReward = (x, y) => {
            if (x === goal.x && y === goal.y) return 100;
            if (obstacles.some(obs => obs.x === x && obs.y === y)) return -50;
            return -1; // Small penalty for each step
        };

        // Get valid actions from a state
        const getValidActions = (x, y) => {
            const actions = [];
            if (y > 0 && !obstacles.some(obs => obs.x === x && obs.y === y - 1)) actions.push('up');
            if (y < gridSize - 1 && !obstacles.some(obs => obs.x === x && obs.y === y + 1)) actions.push('down');
            if (x > 0 && !obstacles.some(obs => obs.x === x - 1 && obs.y === y)) actions.push('left');
            if (x < gridSize - 1 && !obstacles.some(obs => obs.x === x + 1 && obs.y === y)) actions.push('right');
            return actions;
        };

        // Choose action using epsilon-greedy
        const chooseAction = (state, epsilon = 0.1) => {
            const validActions = getValidActions(agent.x, agent.y);
            if (validActions.length === 0) return null;
            
            if (Math.random() < epsilon) {
                return validActions[Math.floor(Math.random() * validActions.length)];
            } else {
                let bestAction = validActions[0];
                let bestValue = qTable[state][bestAction];
                
                validActions.forEach(action => {
                    if (qTable[state][action] > bestValue) {
                        bestValue = qTable[state][action];
                        bestAction = action;
                    }
                });
                
                return bestAction;
            }
        };

        // Move agent based on action
        const moveAgent = (action) => {
            const newPos = { ...agent };
            
            switch (action) {
                case 'up': newPos.y = Math.max(0, newPos.y - 1); break;
                case 'down': newPos.y = Math.min(gridSize - 1, newPos.y + 1); break;
                case 'left': newPos.x = Math.max(0, newPos.x - 1); break;
                case 'right': newPos.x = Math.min(gridSize - 1, newPos.x + 1); break;
            }
            
            agent = newPos;
            return !obstacles.some(obs => obs.x === agent.x && obs.y === agent.y);
        };

        // Q-learning update
        const updateQTable = (state, action, reward, nextState, learningRate, discountFactor) => {
            const currentQ = qTable[state][action];
            const validNextActions = getValidActions(agent.x, agent.y);
            let maxNextQ = 0;
            
            if (validNextActions.length > 0) {
                maxNextQ = Math.max(...validNextActions.map(a => qTable[nextState][a]));
            }
            
            qTable[state][action] = currentQ + learningRate * (reward + discountFactor * maxNextQ - currentQ);
        };

        // Find best path using learned Q-table
        const findBestPath = () => {
            const path = [];
            let current = { x: 0, y: 0 };
            const visited = new Set();
            
            while (current.x !== goal.x || current.y !== goal.y) {
                const stateKey = `${current.x},${current.y}`;
                if (visited.has(stateKey) || path.length > 20) break;
                
                visited.add(stateKey);
                path.push({ ...current });
                
                const validActions = getValidActions(current.x, current.y);
                if (validActions.length === 0) break;
                
                let bestAction = validActions[0];
                let bestValue = qTable[stateKey][bestAction];
                
                validActions.forEach(action => {
                    if (qTable[stateKey][action] > bestValue) {
                        bestValue = qTable[stateKey][action];
                        bestAction = action;
                    }
                });
                
                switch (bestAction) {
                    case 'up': current.y--; break;
                    case 'down': current.y++; break;
                    case 'left': current.x--; break;
                    case 'right': current.x++; break;
                }
            }
            
            if (current.x === goal.x && current.y === goal.y) {
                path.push(current);
            }
            
            return path;
        };

        // Render the grid world
        const render = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Draw grid
            ctx.strokeStyle = '#ddd';
            ctx.lineWidth = 1;
            for (let i = 0; i <= gridSize; i++) {
                ctx.beginPath();
                ctx.moveTo(i * cellSize, 0);
                ctx.lineTo(i * cellSize, gridSize * cellSize);
                ctx.stroke();
                
                ctx.beginPath();
                ctx.moveTo(0, i * cellSize);
                ctx.lineTo(gridSize * cellSize, i * cellSize);
                ctx.stroke();
            }

            // Draw Q-values as heat map
            ctx.globalAlpha = 0.4;
            for (let x = 0; x < gridSize; x++) {
                for (let y = 0; y < gridSize; y++) {
                    const state = `${x},${y}`;
                    const qValues = qTable[state];
                    const maxQ = Math.max(...Object.values(qValues));
                    
                    if (maxQ > 0) {
                        const intensity = Math.min(maxQ / 30, 1);
                        ctx.fillStyle = `rgba(76, 175, 80, ${intensity})`;
                        ctx.fillRect(x * cellSize + 1, y * cellSize + 1, cellSize - 2, cellSize - 2);
                    }
                }
            }
            ctx.globalAlpha = 1;

            // Draw best path
            if (bestPath.length > 1) {
                ctx.strokeStyle = '#2196F3';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(bestPath[0].x * cellSize + cellSize/2, bestPath[0].y * cellSize + cellSize/2);
                for (let i = 1; i < bestPath.length; i++) {
                    ctx.lineTo(bestPath[i].x * cellSize + cellSize/2, bestPath[i].y * cellSize + cellSize/2);
                }
                ctx.stroke();
            }

            // Draw obstacles
            ctx.fillStyle = '#666';
            obstacles.forEach(obs => {
                ctx.fillRect(obs.x * cellSize + 2, obs.y * cellSize + 2, cellSize - 4, cellSize - 4);
            });

            // Draw goal
            ctx.fillStyle = '#4CAF50';
            ctx.fillRect(goal.x * cellSize + 2, goal.y * cellSize + 2, cellSize - 4, cellSize - 4);
            
            // Draw goal symbol
            ctx.fillStyle = '#fff';
            ctx.font = `${cellSize/2}px Arial`;
            ctx.textAlign = 'center';
            ctx.fillText('G', goal.x * cellSize + cellSize/2, goal.y * cellSize + cellSize/2 + cellSize/8);

            // Draw agent
            ctx.fillStyle = '#2196F3';
            ctx.beginPath();
            ctx.arc(
                agent.x * cellSize + cellSize/2, 
                agent.y * cellSize + cellSize/2, 
                cellSize/3, 
                0, 2 * Math.PI
            );
            ctx.fill();
            
            // Draw agent symbol
            ctx.fillStyle = '#fff';
            ctx.font = `${cellSize/3}px Arial`;
            ctx.textAlign = 'center';
            ctx.fillText('A', agent.x * cellSize + cellSize/2, agent.y * cellSize + cellSize/2 + cellSize/12);
        };

        // Run one episode
        const runEpisode = (learningRate, discountFactor) => {
            agent = { x: 0, y: 0 };
            let episodeReward = 0;
            let steps = 0;
            const maxSteps = 50;

            while (steps < maxSteps) {
                const state = `${agent.x},${agent.y}`;
                const action = chooseAction(state, Math.max(0.01, 0.3 - currentEpisode * 0.001));
                
                if (!action) break;
                
                const oldPos = { ...agent };
                const moveSuccessful = moveAgent(action);
                
                if (!moveSuccessful) {
                    agent = oldPos; // Revert if hit obstacle
                }
                
                const reward = getReward(agent.x, agent.y);
                const nextState = `${agent.x},${agent.y}`;
                
                updateQTable(state, action, reward, nextState, learningRate, discountFactor);
                
                episodeReward += reward;
                steps++;
                
                if (agent.x === goal.x && agent.y === goal.y) {
                    break;
                }
            }
            
            return episodeReward;
        };

        // Update slider values
        learningRateSlider.addEventListener('input', (e) => {
            document.getElementById('learning-rate-value').textContent = e.target.value;
        });

        episodesSlider.addEventListener('input', (e) => {
            document.getElementById('episodes-value').textContent = e.target.value;
        });

        // Start learning
        startButton.addEventListener('click', () => {
            if (isLearning) return;
            
            isLearning = true;
            startButton.textContent = 'Learning...';
            startButton.disabled = true;
            
            const learningRate = parseFloat(learningRateSlider.value);
            const maxEpisodes = parseInt(episodesSlider.value);
            
            initQTable();
            currentEpisode = 0;
            totalReward = 0;
            bestPath = [];
            
            const learn = () => {
                const episodeReward = runEpisode(learningRate, 0.95);
                totalReward += episodeReward;
                currentEpisode++;
                
                episodeDisplay.textContent = currentEpisode;
                rewardDisplay.textContent = Math.round(totalReward);
                
                // Update best path every 10 episodes
                if (currentEpisode % 10 === 0) {
                    bestPath = findBestPath();
                }
                
                render();
                
                if (currentEpisode < maxEpisodes) {
                    setTimeout(learn, 50);
                } else {
                    bestPath = findBestPath();
                    render();
                    isLearning = false;
                    startButton.textContent = 'Start Learning';
                    startButton.disabled = false;
                }
            };
            
            learn();
        });

        // Reset
        resetButton.addEventListener('click', () => {
            agent = { x: 0, y: 0 };
            initQTable();
            currentEpisode = 0;
            totalReward = 0;
            bestPath = [];
            episodeDisplay.textContent = '0';
            rewardDisplay.textContent = '0';
            render();
        });

        // Initialize
        initQTable();
        render();
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new MLTutorial();
});

// Add some interactive hover effects
document.addEventListener('DOMContentLoaded', () => {
    // Add hover effects to cards
    const cards = document.querySelectorAll('.ml-type-card, .algorithm-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-8px)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
        });
    });
    
    // Add click effects to buttons
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('click', (e) => {
            const rect = button.getBoundingClientRect();
            const ripple = document.createElement('div');
            ripple.style.position = 'absolute';
            ripple.style.borderRadius = '50%';
            ripple.style.background = 'rgba(255, 255, 255, 0.5)';
            ripple.style.transform = 'scale(0)';
            ripple.style.animation = 'ripple 600ms linear';
            ripple.style.left = e.clientX - rect.left - 10 + 'px';
            ripple.style.top = e.clientY - rect.top - 10 + 'px';
            ripple.style.width = '20px';
            ripple.style.height = '20px';
            ripple.style.pointerEvents = 'none';
            
            button.style.position = 'relative';
            button.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
});

// Add ripple animation
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);