// Mini-jeu Space Invaders en arrière-plan
document.addEventListener("DOMContentLoaded", function() {
    const canvas = document.getElementById('spaceInvaders');
    const ctx = canvas.getContext('2d');
    const scoreCounter = document.getElementById('score-counter').querySelector('span');
    const toggleGameBtn = document.getElementById('toggle-game');
    
    // Variable pour suivre le score
    let score = 0;
    
    // Ajouter ces variables au début du code, après la déclaration des constantes
    let fireRate = 30; // Taux de tir initial (plus petit = plus rapide)
    const minFireRate = 10; // Taux de tir maximum
    const maxFireRate = 50; // Taux de tir minimum
    
    // Fonction pour gérer l'état de visibilité du score
    function updateScoreVisibility() {
        const canvas = document.getElementById('spaceInvaders');
        const scoreCounter = document.getElementById('score-counter');
        const fullText = document.getElementById('text-full');
        
        // Le score doit être visible si:
        // 1. Le jeu est visible (canvas affiché)
        // 2. ET le texte complet n'est PAS affiché
        const gameVisible = canvas.style.display === 'block';
        const fullTextVisible = fullText.style.display !== 'none';
        
        scoreCounter.style.display = (gameVisible && !fullTextVisible) ? 'block' : 'none';
    }
    
    // Gestion de l'affichage du jeu
    toggleGameBtn.addEventListener('click', function() {
        const canvas = document.getElementById('spaceInvaders');
        const container = document.querySelector('.container');
        const closeBtn = document.getElementById('close-game');
        const scoreCounter = document.getElementById('score-counter');
        
        // Afficher le jeu en plein écran
        canvas.style.display = 'block';
        canvas.classList.add('fullscreen');
        scoreCounter.style.display = 'block';
        
        // Cacher le conteneur principal
        container.style.display = 'none';
        
        // Afficher le bouton de fermeture
        closeBtn.style.display = 'flex';
        
        // Réinitialiser le jeu
        score = 0;
        updateScore();
        createInvaders();
    });

    // Ajouter le gestionnaire d'événements pour le bouton de fermeture
    document.getElementById('close-game').addEventListener('click', function() {
        const canvas = document.getElementById('spaceInvaders');
        const container = document.querySelector('.container');
        const closeBtn = document.getElementById('close-game');
        const scoreCounter = document.getElementById('score-counter');
        
        // Cacher le jeu et le bouton de fermeture
        canvas.style.display = 'none';
        canvas.classList.remove('fullscreen');
        closeBtn.style.display = 'none';
        scoreCounter.style.display = 'none';
        
        // Réafficher le conteneur principal
        container.style.display = 'flex';
    });
    
    // Interaction avec le bouton "Lire la suite"/"Voir moins"
    document.getElementById('read-more-btn').addEventListener('click', function() {
        // Attendre un moment pour que les changements de style soient appliqués
        setTimeout(updateScoreVisibility, 10);
    });
    
    // Fonction pour mettre à jour le score
    function updateScore() {
        scoreCounter.textContent = score;
    }
    
    // Ajuster la taille du canvas à la fenêtre
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Couleurs du thème
    const COLORS = {
        purple: '#bf00ff',
        green: '#00ff00',
        white: '#ffffff',
        yellow: '#ffff00',
        black: 'rgba(0,0,0,0.7)'
    };
    
    // Tableau de couleurs pour les effets (limité aux couleurs demandées)
    const effectColors = [COLORS.purple, COLORS.green, COLORS.white, COLORS.yellow];
    
    // Préchargement des images
    const playerImage = new Image();
    playerImage.src = 'https://i.postimg.cc/xdZM6yBS/Pngtree-hand-drawn-spaceship-purple-spaceship-3899830.png';
    
    const invaderImage = new Image();
    invaderImage.src = 'https://i.postimg.cc/SQC1zJzK/favpng-space-invaders-extreme-2-nintendo-ds.png';

    // Position de la souris
    let mouseX = canvas.width / 2;
    
    // Suivre la position de la souris
    document.addEventListener('mousemove', function(event) {
        mouseX = event.clientX;
    });

    // Ajouter après l'écouteur de mousemove
    document.addEventListener('keydown', function(event) {
        if (event.code === 'Space' && player.bombAmmo > 0) {
            player.shootBomb();
        }
    });

    // Ajouter l'écouteur d'événement pour la molette de la souris après les autres écouteurs
    document.addEventListener('wheel', function(event) {
        // Empêcher le scroll de la page
        event.preventDefault();
        
        // Ajuster le taux de tir en fonction de la direction du scroll
        if (event.deltaY < 0) {
            // Scroll vers le haut = tir plus rapide
            fireRate = Math.max(minFireRate, fireRate - 2);
        } else {
            // Scroll vers le bas = tir plus lent
            fireRate = Math.min(maxFireRate, fireRate + 2);
        }
    });

    // Classe pour le vaisseau joueur
    class Player {
        constructor() {
            this.width = 60;
            this.height = 60;
            this.x = canvas.width / 2 - this.width / 2;
            this.y = canvas.height - 180; // Remonté plus haut pour laisser de l'espace avec le score
            this.speed = 5;
            this.cooldown = fireRate;
            this.bullets = [];
            this.alive = true;
            this.blinkTime = 0;
            this.multiShot = false;
            this.multiShotTimer = 0;
            this.thrusterParticles = []; // Tableau pour stocker les particules des propulseurs
            this.thrusterCooldown = 0;
            this.bombAmmo = 0;
            this.killCount = 0;
        }
        
        update() {
            // Suivre la position de la souris
            const targetX = mouseX - this.width / 2;
            // Déplacement fluide
            this.x += (targetX - this.x) * 0.1;
            
            // Limiter aux bords de l'écran
            if (this.x < 0) this.x = 0;
            if (this.x > canvas.width - this.width) this.x = canvas.width - this.width;
            
            // Gestion du tir automatique avec modes de tir aléatoires
            if (this.cooldown <= 0 && this.alive) {
                // Chance de tir multiple
                if (Math.random() < 0.1) {
                    this.multiShot = true;
                    this.multiShotTimer = 100; // Durée du mode multi-tir
                }
                
                if (this.multiShot) {
                    // Mode salve (3 tirs)
                    this.shootSalvo();
                } else {
                    // Tir normal
                    this.shoot();
                }
                
                // Utiliser fireRate au lieu d'une valeur fixe
                this.cooldown = fireRate;
            } else {
                this.cooldown--;
            }
            
            // Gestion du timer multiShot
            if (this.multiShotTimer > 0) {
                this.multiShotTimer--;
            } else {
                this.multiShot = false;
            }
            
            // Effet de clignotement si touché
            if (this.blinkTime > 0) {
                this.blinkTime--;
            }
            
            // Mise à jour des balles
            for (let i = this.bullets.length - 1; i >= 0; i--) {
                this.bullets[i].update();
                if (this.bullets[i].y < 0) {
                    this.bullets.splice(i, 1);
                }
            }

            // Génération de particules pour les propulseurs
            if (this.alive) {
                this.thrusterCooldown--;
                if (this.thrusterCooldown <= 0) {
                    // Position des propulseurs (gauche et droit)
                    this.thrusterParticles.push(new ThrusterParticle(this.x + 15, this.y + this.height));
                    this.thrusterParticles.push(new ThrusterParticle(this.x + this.width - 15, this.y + this.height));
                    this.thrusterCooldown = 2; // Fréquence de génération des particules
                }
                
                // Mise à jour et nettoyage des particules des propulseurs
                for (let i = this.thrusterParticles.length - 1; i >= 0; i--) {
                    this.thrusterParticles[i].update();
                    if (this.thrusterParticles[i].life <= 0) {
                        this.thrusterParticles.splice(i, 1);
                    }
                }
            }

            if (this.killCount >= 10) { // Gagner une bombe tous les 10 kills
                this.bombAmmo++;
                this.killCount = 0;
            }
        }
        
        shootSalvo() {
            // Tir seulement vertical (suppression des tirs diagonaux)
            this.bullets.push(new Bullet(this.x + this.width / 2, this.y, 0));
            this.bullets.push(new Bullet(this.x + this.width / 2 - 10, this.y, 0));
            this.bullets.push(new Bullet(this.x + this.width / 2 + 10, this.y, 0));
        }
        
        shoot() {
            this.bullets.push(new Bullet(this.x + this.width / 2, this.y, 0));
        }
        
        shootBomb() {
            if (this.bombAmmo > 0) {
                this.bullets.push(new Bomb(this.x + this.width/2, this.y));
                this.bombAmmo--;
            }
        }

        hit() {
            // Le vaisseau est touché
            this.alive = false;
            this.blinkTime = 60; // Durée du clignotement
            score = 0;
            updateScore();
            
            // Créer une explosion pour le vaisseau
            createExplosion(this.x + this.width / 2, this.y + this.height / 2, 30);
            
            // Réinitialiser après un court délai
            setTimeout(() => {
                this.alive = true;
            }, 1500);
        }
        
        draw() {
            // Ne pas dessiner si détruit ou clignotement pair
            if (!this.alive || (this.blinkTime > 0 && this.blinkTime % 10 < 5)) {
                return;
            }
            
            // Dessiner d'abord les particules des propulseurs en arrière-plan
            this.thrusterParticles.forEach(particle => particle.draw());

            // Dessiner l'image du vaisseau du joueur
            ctx.drawImage(playerImage, this.x, this.y, this.width, this.height);
            
            // Supprimer l'effet néon autour du vaisseau
            
            // Dessiner les balles
            this.bullets.forEach(bullet => bullet.draw());
        }
    }

    // Classe pour les balles
    class Bullet {
        constructor(x, y, angleOffset = 0) {
            this.x = x;
            this.y = y;
            this.width = 4; // Légèrement plus large
            this.height = 12; // Plus longue
            this.speed = 7;
            this.angleOffset = angleOffset;
            this.color = effectColors[Math.floor(Math.random() * effectColors.length)];
            this.isEnemyBullet = false;
            this.glowIntensity = Math.random() * 5 + 15; // Intensité aléatoire pour l'effet glow
            this.pulseDirection = 1; // Direction de pulsation (1: croissante, -1: décroissante)
            this.pulseSpeed = Math.random() * 0.2 + 0.1; // Vitesse de pulsation
        }
        
        update() {
            if (this.isEnemyBullet) {
                this.y += this.speed;
                // Vérifier collision avec le joueur
                if (player.alive && 
                    this.x > player.x && this.x < player.x + player.width &&
                    this.y > player.y && this.y < player.y + player.height) {
                    player.hit();
                    this.y = canvas.height + 10; // Supprimer la balle
                }
            } else {
                this.y -= this.speed;
                this.x += this.angleOffset * this.speed;
            }
            
            // Effet de pulsation pour l'effet glow
            this.glowIntensity += this.pulseDirection * this.pulseSpeed;
            
            // Inverser la direction lorsque les limites sont atteintes
            if (this.glowIntensity > 25) {
                this.pulseDirection = -1;
            } else if (this.glowIntensity < 15) {
                this.pulseDirection = 1;
            }
        }
        
        draw() {
            // Effet de traînée (une copie plus faible derrière)
            ctx.globalAlpha = 0.4;
            ctx.fillStyle = this.color;
            ctx.shadowColor = this.color;
            ctx.shadowBlur = this.glowIntensity / 2;
            ctx.fillRect(this.x - this.width / 2, this.y + (this.isEnemyBullet ? -10 : 10), this.width, this.height);
            
            // Tir principal avec effet néon/glow fort
            ctx.globalAlpha = 1.0;
            ctx.fillStyle = this.color;
            ctx.shadowColor = this.color;
            ctx.shadowBlur = this.glowIntensity; // Utiliser l'intensité variable
            ctx.fillRect(this.x - this.width / 2, this.y, this.width, this.height);
            
            // Ajouter un contour lumineux
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1;
            ctx.strokeRect(this.x - this.width / 2, this.y, this.width, this.height);
            
            // Réinitialiser les paramètres de contexte
            ctx.shadowBlur = 0;
            ctx.globalAlpha = 1.0;
        }
    }
    
    // Ajouter après la classe Bullet
    class Bomb extends Bullet {
        constructor(x, y) {
            super(x, y, 0);
            this.explosionRadius = 100;
            this.width = 8;
            this.height = 16;
            this.speed = 5;
            this.color = COLORS.purple;
            this.hasExploded = false;
        }

        update() {
            if (!this.hasExploded) {
                this.y -= this.speed;
                
                // Effet de pulsation plus prononcé pour la bombe
                this.glowIntensity += this.pulseDirection * (this.pulseSpeed * 2);
                
                if (this.y <= 200) { // Explosion à une certaine hauteur
                    this.explode();
                }
            }
        }

        explode() {
            this.hasExploded = true;
            createExplosion(this.x, this.y, 50); // Plus de particules
            
            // Dégâts de zone
            invaders.forEach((invader, index) => {
                const distance = Math.sqrt(
                    Math.pow(this.x - (invader.x + invader.width/2), 2) +
                    Math.pow(this.y - (invader.y + invader.height/2), 2)
                );
                
                if (distance <= this.explosionRadius) {
                    const damage = Math.floor(3 * (1 - distance/this.explosionRadius));
                    for(let i = 0; i < damage; i++) {
                        invader.takeDamage();
                    }
                }
            });
        }

        draw() {
            if (this.hasExploded) return;
            
            // Effet de traînée spécial pour la bombe
            ctx.globalAlpha = 0.6;
            ctx.fillStyle = this.color;
            ctx.shadowColor = this.color;
            ctx.shadowBlur = this.glowIntensity;
            
            // Corps de la bombe
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.x - this.width/2, this.y + this.height);
            ctx.lineTo(this.x + this.width/2, this.y + this.height);
            ctx.closePath();
            ctx.fill();
            
            // Réinitialiser les paramètres
            ctx.shadowBlur = 0;
            ctx.globalAlpha = 1.0;
        }
    }

    // Classe pour les effets de particules (explosions)
    class Particle {
        constructor(x, y, size = null, speedMultiplier = 1) {
            this.x = x;
            this.y = y;
            this.size = size || Math.random() * 3 + 2;
            this.speedX = (Math.random() * 4 - 2) * speedMultiplier;
            this.speedY = (Math.random() * 4 - 2) * speedMultiplier;
            this.color = effectColors[Math.floor(Math.random() * effectColors.length)]; // Utiliser les couleurs limitées
            this.life = 30;
            this.opacity = 1;
        }
        
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            this.life--;
            this.opacity = this.life / 30; // Faire disparaître progressivement
        }
        
        draw() {
            ctx.globalAlpha = this.opacity;
            ctx.fillStyle = this.color;
            ctx.shadowColor = this.color;
            ctx.shadowBlur = 5;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.globalAlpha = 1.0;
        }
    }

    // Classe pour les particules des propulseurs du vaisseau
    class ThrusterParticle {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.size = Math.random() * 3 + 2;
            this.speedY = Math.random() * 1 + 2; // Vitesse vers le bas
            this.speedX = (Math.random() - 0.5) * 0.5; // Légère déviation horizontale
            this.color = COLORS.green; // Vert fluo uniquement pour les propulseurs
            this.life = 20;
            this.opacity = Math.random() * 0.5 + 0.5; // Opacité variable
        }
        
        update() {
            this.y += this.speedY;
            this.x += this.speedX;
            this.life--;
            this.opacity = this.life / 20; // Diminue progressivement
            this.size *= 0.95; // Rétrécit progressivement
        }
        
        draw() {
            ctx.globalAlpha = this.opacity;
            ctx.fillStyle = this.color;
            ctx.shadowColor = this.color;
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.globalAlpha = 1.0;
        }
    }

    // Classe pour les envahisseurs
    class Invader {
        constructor(x, y) {
            this.width = 40;
            this.height = 40;
            this.x = x;
            this.y = y;
            this.baseX = x;
            this.baseY = y;
            this.baseSpeed = Math.random() * 0.5 + 0.5; // Vitesse aléatoire
            this.speed = this.baseSpeed;
            this.direction = Math.random() < 0.5 ? -1 : 1; // Direction initiale aléatoire
            this.sinAmplitude = Math.random() * 3;
            this.sinFrequency = Math.random() * 0.05;
            this.sinOffset = Math.random() * Math.PI * 2;
            this.frame = 0;
            this.canShoot = Math.random() < 0.4; // Augmenté à 40% des envahisseurs qui peuvent tirer
            this.shootCooldown = Math.floor(Math.random() * 120) + 80; // Réduit davantage pour les plus rapides
            this.health = Math.floor(Math.random() * 4) + 3; // Entre 3 et 6 points de vie (au lieu de 5-10)
            this.maxHealth = this.health; // Pour garder une référence à la santé max
            this.hitFlash = 0; // Pour l'effet visuel quand touché
        }
        
        update() {
            this.frame++;
            
            // Mouvement de base (gauche-droite)
            this.x += this.speed * this.direction;
            
            // Mouvement sinusoïdal supplémentaire
            this.y = this.baseY + Math.sin((this.frame * this.sinFrequency) + this.sinOffset) * this.sinAmplitude;
            
            // Changer de direction si atteinte d'un bord
            if (this.x <= 0 || this.x >= canvas.width - this.width) {
                this.direction *= -1;
                this.y += 10;
                this.baseY = this.y;
            }
            
            // Vérification de collision avec d'autres envahisseurs
            invaders.forEach(otherInvader => {
                if (otherInvader !== this) {
                    if (this.checkCollision(otherInvader)) {
                        this.direction *= -1; // Changer de direction si collision
                        otherInvader.direction *= -1;
                    }
                }
            });
            
            // Tir aléatoire si l'envahisseur peut tirer
            if (this.canShoot) {
                this.shootCooldown--;
                if (this.shootCooldown <= 0) {
                    this.shoot();
                    this.shootCooldown = Math.floor(Math.random() * 120) + 80; // Cooldown réduit
                }
            }
            
            // Diminuer l'effet de flash quand touché
            if (this.hitFlash > 0) {
                this.hitFlash--;
            }
        }
        
        // Méthode pour détecter les collisions entre envahisseurs
        checkCollision(other) {
            return (
                this.x < other.x + other.width &&
                this.x + this.width > other.x &&
                this.y < other.y + other.height &&
                this.y + this.height > other.y
            );
        }
        
        // Méthode pour gérer les dégâts
        takeDamage() {
            this.health--;
            this.hitFlash = 5; // Durée de l'effet visuel
            return this.health <= 0; // Retourne true si l'ennemi est détruit
        }
        
        shoot() {
            const bullet = new Bullet(this.x + this.width / 2, this.y + this.height);
            bullet.color = COLORS.red;
            bullet.isEnemyBullet = true;
            player.bullets.push(bullet); // On réutilise le même tableau pour simplicité
        }
        
        draw() {
            // Appliquer un effet visuel quand touché
            if (this.hitFlash > 0) {
                ctx.globalAlpha = 0.7;
            }
            
            // Dessiner l'image de l'envahisseur
            ctx.drawImage(invaderImage, this.x, this.y, this.width, this.height);
            
            // Réinitialiser l'opacité
            ctx.globalAlpha = 1.0;
            
            // Suppression des barres de vie - les envahisseurs ont toujours de la santé,
            // mais les barres ne sont plus affichées
        }
    }
    
    // Ajouter après la classe Invader
    class InvaderManager {
        constructor() {
            this.invaders = [];
            this.eventTimer = 0;
            this.eventInterval = 300; // Délai entre les événements
        }

        update() {
            this.eventTimer++;
            if (this.eventTimer >= this.eventInterval) {
                this.triggerRandomEvent();
                this.eventTimer = 0;
            }

            this.invaders.forEach(invader => invader.update());
        }

        triggerRandomEvent() {
            const event = Math.random();
            
            if (event < 0.3) { // 30% chance de pluie d'attaques
                this.rainAttack();
            } else if (event < 0.6) { // 30% chance de téléportation
                this.teleportInvaders();
            } else { // 40% chance de vague d'invisibilité
                this.invisibilityWave();
            }
        }

        rainAttack() {
            this.invaders.forEach(invader => {
                if (Math.random() < 0.7) { // 70% de chance de tirer pour chaque invader
                    invader.shoot();
                }
            });
        }

        teleportInvaders() {
            this.invaders.forEach(invader => {
                if (Math.random() < 0.3) { // 30% de chance de téléportation
                    invader.x = Math.random() * (canvas.width - invader.width);
                    invader.y = Math.random() * 200 + 50;
                    
                    // Effet visuel de téléportation
                    createExplosion(invader.x, invader.y, 10);
                }
            });
        }

        invisibilityWave() {
            this.invaders.forEach(invader => {
                if (Math.random() < 0.5) { // 50% de chance de devenir invisible
                    invader.isInvisible = true;
                    setTimeout(() => {
                        invader.isInvisible = false;
                    }, 2000); // Redevient visible après 2 secondes
                }
            });
        }
    }
    
    // Initialisation du jeu
    const player = new Player();
    let invaders = [];
    
    // Créer des envahisseurs de façon aléatoire
    function createInvaders() {
        invaders = [];
        
        // Nombre total d'envahisseurs
        const invaderCount = 20;
        
        for (let i = 0; i < invaderCount; i++) {
            // Positions aléatoires (en respectant les bords et en évitant trop de chevauchements)
            const x = Math.random() * (canvas.width - 100) + 50;
            const y = Math.random() * 200 + 50; // Répartis dans les 200 premiers pixels verticalement
            
            // Vérifier si la position est trop proche d'un autre envahisseur
            let validPosition = true;
            for (const existing of invaders) {
                const distance = Math.sqrt(
                    Math.pow(x - existing.x, 2) + Math.pow(y - existing.y, 2)
                );
                if (distance < 60) { // Distance minimale entre envahisseurs
                    validPosition = false;
                    break;
                }
            }
            
            // Si la position est valide, créer l'envahisseur
            if (validPosition || invaders.length < 5) { // Toujours créer au moins 5 envahisseurs
                const invader = new Invader(x, y);
                invader.baseY = y;
                invaders.push(invader);
            } else {
                // Réessayer si la position n'est pas valide
                i--;
            }
        }
    }
    
    // Tableau de particules pour les explosions
    let particles = [];
    
    // Fonction pour créer une explosion plus élaborée
    function createExplosion(x, y, particleCount) {
        // Première vague de particules (petit cercle)
        for (let i = 0; i < particleCount / 2; i++) {
            particles.push(new Particle(x, y, Math.random() * 4 + 3, 1.5));
        }
        
        // Deuxième vague de particules après un délai (anneau extérieur)
        setTimeout(() => {
            for (let i = 0; i < particleCount / 2; i++) {
                const angle = Math.random() * Math.PI * 2;
                const distance = Math.random() * 20 + 10;
                const px = x + Math.cos(angle) * distance;
                const py = y + Math.sin(angle) * distance;
                
                particles.push(new Particle(px, py, Math.random() * 3 + 1, 0.7));
            }
        }, 100);
        
        // Ajouter un flash lumineux au centre de l'explosion
        ctx.globalAlpha = 0.7;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(x, y, 15, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
    }
    
    // Animation du jeu
    function gameLoop() {
        // Effacer le canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Mise à jour des éléments
        player.update();
        
        invaders.forEach(invader => {
            invader.update();
        });
        
        // Mise à jour des particules
        for (let i = particles.length - 1; i >= 0; i--) {
            particles[i].update();
            if (particles[i].life <= 0) {
                particles.splice(i, 1);
            }
        }
        
        // Vérification des collisions
        player.bullets.forEach((bullet, bulletIndex) => {
            // Ignorer les balles ennemies
            if (bullet.isEnemyBullet) return;
            
            invaders.forEach((invader, index) => {
                if (bullet.x > invader.x && bullet.x < invader.x + invader.width &&
                    bullet.y > invader.y && bullet.y < invader.y + invader.height) {
                    
                    // Supprimer la balle
                    bullet.y = -10;
                    
                    // Appliquer des dégâts à l'envahisseur
                    const isDestroyed = invader.takeDamage();
                    
                    // Si l'envahisseur est détruit
                    if (isDestroyed) {
                        // Créer une explosion de particules avec les couleurs thématiques
                        createExplosion(invader.x + invader.width / 2, invader.y + invader.height / 2, 20);
                        
                        // Supprimer l'envahisseur
                        invaders.splice(index, 1);
                        
                        // Incrémenter le score et mettre à jour l'affichage
                        if (player.alive) {
                            score++;
                            updateScore();
                            player.killCount++;
                        }
                    } else {
                        // Créer quelques particules pour indiquer le coup sans destruction
                        for (let i = 0; i < 3; i++) {
                            particles.push(new Particle(
                                bullet.x, 
                                bullet.y,
                            ));
                        }
                    }
                }
            });
        });
        
        // Recréer les envahisseurs s'ils sont tous détruits
        if (invaders.length === 0) {
            createInvaders();
        }
        
        // Dessiner les éléments
        player.draw();
        invaders.forEach(invader => invader.draw());
        
        // Dessiner les particules
        particles.forEach(particle => particle.draw());
        
        // Boucler l'animation
        requestAnimationFrame(gameLoop);
    }
    
    // Attendre le chargement des images avant de lancer le jeu
    let imagesLoaded = 0;
    const totalImages = 2;
    
    function imageLoaded() {
        imagesLoaded++;
        if (imagesLoaded === totalImages) {
            createInvaders();
            gameLoop();
        }
    }
    
    playerImage.onload = imageLoaded;
    invaderImage.onload = imageLoaded;
});
