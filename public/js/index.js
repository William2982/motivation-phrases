// REDIRECCIONAR
document.querySelector('#btn-login').addEventListener('click', () => {
    window.location.href = 'login.html';
});

// LEER DATOS
const contentData = document.querySelector('.container');
contentData.innerHTML += ``;

db.collection("frases").onSnapshot((querySnapshot) => {
    contentData.innerHTML = '';
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        contentData.innerHTML += `
        <div class="post">
            <img class="img-frases" data-file="${data.foto}" src="" alt=" ">
            <div class="frase-container">
                <h2>${data.frase}</h2>
                <p>- ${data.autor}</p>
            </div>
        </div>
        `;
    });
    // Leer storage
    const ref = storage.ref();
    ref.listAll().then((result) => {
        result.items.forEach((imageRef) => {
            imageRef.getDownloadURL().then((url) => {
                // console.log(`URL para ${imageRef.name}: ${url}`);
                const imgElements = document.querySelectorAll(`.post .img-frases[data-file="${imageRef.name}"]`);
                imgElements.forEach((img) => {
                    img.src = url;
                });
            }).catch((error) => {
                // console.error('Error al obtener la URL de la imagen:', error);
            });
        });
    }).catch((error) => {
        // console.error('Error al listar las imágenes:', error);
    });
});