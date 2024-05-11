//console.log(faceapi);




// Fonction pour démarrer la détection de visage
async function startDetection() {
    // Charger les modèles
    await Promise.all([
        faceapi.nets.ssdMobilenetv1.loadFromUri('./models'),
        faceapi.nets.faceLandmark68Net.loadFromUri('./models'),
        faceapi.nets.faceRecognitionNet.loadFromUri('./models'),
        faceapi.nets.ageGenderNet.loadFromUri('./models'),
        faceapi.nets.faceExpressionNet.loadFromUri('./models')
    ]);

    // Obtenir la vidéo depuis le DOM
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');

    // Obtenir l'accès à la webcam
    const stream = await navigator.mediaDevices.getUserMedia({ video: {} });

    // Attendre que la vidéo ait terminé de charger ses métadonnées
    await new Promise(resolve => {
        video.onloadedmetadata = resolve;
        video.srcObject = stream; // Ajouter le flux vidéo à l'élément vidéo
    });

    // Taille du canevas
    const displaySize = { width: video.videoWidth, height: video.videoHeight };
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Démarrer la détection de visage
    setInterval(async () => {
        // Détecter les visages dans le flux vidéo
        const detections = await faceapi.detectAllFaces(video)
            .withFaceLandmarks()
            .withFaceDescriptors()
            .withAgeAndGender()
            .withFaceExpressions();

        // Effacer le canevas
        const context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);

        // Dessiner les détections sur le canevas
        faceapi.draw.drawDetections(canvas, detections);

        // Ajouter les informations d'âge, de genre et d'émotion
        detections.forEach(face => {
            const { age, gender, genderProbability, expressions } = face;
            const genderText = `${gender} (${(genderProbability * 100).toFixed(2)}%)`;
            const ageText = `Age: ${Math.round(age)}`;
            const emotionText = Object.keys(expressions).reduce((a, b) => expressions[a] > expressions[b] ? a : b);
            //const text = `${genderText}, ${ageText}, Emotion: ${emotionText}`;
            //const x = face.detection.box.x;
            //const y = face.detection.box.y + face.detection.box.height + 10;
            //context.fillText(text, x, y);
            const textField = new faceapi.draw.DrawTextField([genderText, ageText, emotionText], face.detection.box.bottomLeft)
            textField.draw(canvas)
            // Constante pour retourner l'heure actuelle au format "heure:minute:seconde:milliseconde"
            const heureActuelle = () => {
            const maintenant = new Date();
            const heure = maintenant.getHours();
            const minute = maintenant.getMinutes();
            const seconde = maintenant.getSeconds();
            const milliseconde = maintenant.getMilliseconds();
            
            // Ajout de zéro devant les chiffres si nécessaire
            const formatNombre = (nombre) => {
                return nombre < 10 ? '0' + nombre : nombre;
            };

            return `${formatNombre(heure)}:${formatNombre(minute)}:${formatNombre(seconde)}:${milliseconde}`;
        };

        // Constante pour retourner la date actuelle au format "dd/mm/aaaa"
        const dateActuelle = () => {
            const maintenant = new Date();
            const jour = maintenant.getDate();
            const mois = maintenant.getMonth() + 1; // Les mois commencent à partir de 0, donc +1
            const annee = maintenant.getFullYear();
            
            return `${formatNombre(jour)}/${formatNombre(mois)}/${annee}`;
        };

        // Fonction de formatage pour ajouter un zéro devant les chiffres si nécessaire
        const formatNombre = (nombre) => {
            return nombre < 10 ? '0' + nombre : nombre;
        };

        const hh = heureActuelle() ;
        const dd = dateActuelle() ;
        const identiqueFormatted = parseFloat(genderProbability).toFixed(2);
            const showData = {
                identique : identiqueFormatted,
                age : ageText,
                sexe : genderText,
                emotion :emotionText,
                heure : hh ,
                date : dd
            };
            console.log(showData);
        });

    }, 100); // Rafraîchir toutes les 100 millisecondes
}

// Démarrer la détection de visage
startDetection().catch(err => console.error(err));

