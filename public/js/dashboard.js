// REDIRECCIONAR
document.querySelector('#btn-logout').addEventListener('click', () => {
    logout();
});

// VARIABLES GLOBALES
let itemIdToEdit = null;
let currentImageFileName = null;
let itemIdToDelete = null;

// DATATABLES
const tablaFrases = $('#tabla-frases').DataTable({
    "lengthMenu": [[-1, 50, 10, 5], ["Todos", 50, 10, 5]],
    language: {
        loadingRecords: "Cargando...",
        emptyTable: "No hay datos añadidos aún",
        zeroRecords: "No se encontraron resultados",
        search: "Buscar:",
        lengthMenu: "Mostrar _MENU_ entradas",
        info: "Mostrando _START_ a _END_ de _TOTAL_ entradas",
        paginate: {
            first: "Primero",
            last: "Último",
            next: "Siguiente",
            previous: "Anterior",
        },
    },
    rowId: 'id'
});

// AÑADIR
const formAdd = document.querySelector('#form-add');
formAdd.addEventListener('submit', (e) => {
    e.preventDefault();
    const frase = document.getElementById('add-frase').value;
    const autor = document.getElementById('add-autor').value;
    const fileInput = document.getElementById('add-imagen');

    const file = fileInput.files[0];
    if (file) {
        compressImage(file, 800, 800, 0.8).then((compressedFile) => {
            const newDocRef = db.collection("frases").doc();
            const newFileName = newDocRef.id;

            storage.ref().child(newFileName).put(compressedFile).then(() => {
                // console.log('Imagen comprimida y subida');
                newDocRef.set({
                    frase: frase,
                    autor: autor,
                    foto: newFileName
                }).then(() => {
                    // console.log('Documento añadido');
                    formAdd.reset();
                    const previewImagen = document.getElementById('preview-imagen-add');
                    previewImagen.src = '';
                    previewImagen.classList.add('hidden');
                    document.getElementById('modal-add').close();
                }).catch((error) => {
                    // console.error('Error al añadir el documento a Firestore:', error);
                });
            }).catch((error) => {
                // console.error('Error al subir la imagen:', error);
            });
        });
    }
});
// Previsualizar imagen Añadir
document.getElementById('add-imagen').addEventListener('change', function () {
    const file = this.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const preview = document.getElementById('preview-imagen-add');
            preview.src = e.target.result;
            preview.classList.remove('hidden');
        };
        reader.readAsDataURL(file);
    }
});

// LEER
db.collection("frases").onSnapshot((querySnapshot) => {
    tablaFrases.clear();
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        tablaFrases.row.add([
            `<img class="img-frases" data-file="${data.foto}" src="" alt=" ">`,
            data.autor,
            data.frase,
            `<button class="btn-edit-open-modal" data-id="${doc.id}" data-file="${data.foto}">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path fill="currentColor" d="m2.292 13.36l4.523 4.756L.5 20zM12.705 2.412l4.522 4.755L7.266 17.64l-4.523-4.754zM16.142.348l2.976 3.129c.807.848.086 1.613.086 1.613l-1.521 1.6l-4.524-4.757L14.68.334l.02-.019c.119-.112.776-.668 1.443.033" />
                    </svg>
            </button>`,
            `<button class="btn-delete-open-modal" data-id="${doc.id}" data-file="${data.foto}">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <g fill="none" fill-rule="evenodd">
                            <path d="m12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035q-.016-.005-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093q.019.005.029-.008l.004-.014l-.034-.614q-.005-.018-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z" />
                            <path fill="currentColor" d="M14.28 2a2 2 0 0 1 1.897 1.368L16.72 5H20a1 1 0 1 1 0 2l-.003.071l-.867 12.143A3 3 0 0 1 16.138 22H7.862a3 3 0 0 1-2.992-2.786L4.003 7.07L4 7a1 1 0 0 1 0-2h3.28l.543-1.632A2 2 0 0 1 9.721 2zM9 10a1 1 0 0 0-.993.883L8 11v6a1 1 0 0 0 1.993.117L10 17v-6a1 1 0 0 0-1-1m6 0a1 1 0 0 0-1 1v6a1 1 0 1 0 2 0v-6a1 1 0 0 0-1-1m-.72-6H9.72l-.333 1h5.226z" />
                        </g>
                    </svg>
            </button>`,
        ]).draw(false);
    });
    // Leer storage
    const ref = storage.ref();
    ref.listAll().then((result) => {
        result.items.forEach((imageRef) => {
            imageRef.getDownloadURL().then((url) => {
                // console.log(`URL para ${imageRef.name}: ${url}`);
                const imgElements = document.querySelectorAll(`#tabla-frases .img-frases[data-file="${imageRef.name}"]`);
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

// EDITAR
document.querySelector('#form-edit').addEventListener('submit', (e) => {
    e.preventDefault();
    const frase = document.getElementById('edit-frase').value;
    const autor = document.getElementById('edit-autor').value;
    const fileInput = document.getElementById('edit-imagen');

    let newFileName = currentImageFileName;

    if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        newFileName = itemIdToEdit;
        compressImage(file, 800, 800, 0.8).then((compressedFile) => {
            const fileRef = storage.ref().child(newFileName);
            fileRef.put(compressedFile).then(() => {
                // console.log('Nueva imagen comprimida y subida');
                updateFirestoreData(frase, autor, newFileName);
            }).catch((error) => {
                // console.error('Error al subir la imagen:', error);
            });
        });
    } else {
        updateFirestoreData(frase, autor, currentImageFileName);
    }
});
// Actualizar datos
function updateFirestoreData(frase, autor, foto) {
    db.collection("frases").doc(itemIdToEdit).update({
        frase: frase,
        autor: autor,
        foto: foto
    }).then(() => {
        // console.log('Documento actualizado');
        document.getElementById('modal-edit').close();
    }).catch((error) => {
        // console.error('Error al actualizar el documento de Firestore:', error);
    });
}
// Previsualizar imagen Editar
document.getElementById('edit-imagen').addEventListener('change', function () {
    const file = this.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const preview = document.getElementById('preview-imagen-edit');
            preview.src = e.target.result;
            preview.classList.remove('hidden');
        };
        reader.readAsDataURL(file);
    }
});

// ELIMINAR
document.querySelector('#btn-delete').addEventListener('click', () => {
    if (itemIdToDelete) {
        db.collection("frases").doc(itemIdToDelete).get().then((doc) => {
            const fileName = doc.data().foto;
            const fileRef = storage.ref().child(fileName);
            fileRef.delete().then(() => {
                // console.log('Imagen eliminada');
                db.collection("frases").doc(itemIdToDelete).delete().then(() => {
                    // console.log('Documento eliminado');
                    document.getElementById('modal-delete').close();
                }).catch((error) => {
                    // console.error('Error al eliminar el documento de Firestore:', error);
                });
            }).catch((error) => {
                // console.error('Error al eliminar la imagen:', error);
            });
        }).catch((error) => {
            // console.error('Error al obtener los datos del documento:', error);
        });
    }
});


// COMPRIMIR IMAGENES
function compressImage(file, maxWidth, maxHeight, quality = 0.8) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const reader = new FileReader();
        reader.onload = function (event) {
            img.src = event.target.result;
        };
        img.onload = function () {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            let width = img.width;
            let height = img.height;
            if (width > height) {
                if (width > maxWidth) {
                    height *= maxWidth / width;
                    width = maxWidth;
                }
            } else {
                if (height > maxHeight) {
                    width *= maxHeight / height;
                    height = maxHeight;
                }
            }
            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);
            canvas.toBlob((blob) => {
                resolve(blob);
            }, 'image/jpeg', quality);
        };
        reader.readAsDataURL(file);
    });
}

// MODALES
// Cerrar modal cuando se hace clic fuera de su contenido
const modales = document.querySelectorAll("dialog");
modales.forEach(element => {
    element.addEventListener('click', (e) => {
        const rect = element.getBoundingClientRect();
        const isInDialog = (e.clientX >= rect.left && e.clientX <= rect.right &&
            e.clientY >= rect.top && e.clientY <= rect.bottom);
        if (!isInDialog) {
            element.close();
        }
    });
});
// Modal Añadir
const modalAdd = document.querySelector('#modal-add');
document.querySelector('#btn-add-open-modal').addEventListener('click', () => {
    modalAdd.showModal();
});
document.querySelector('#btn-add-close-modal').addEventListener('click', () => {
    modalAdd.close();
});
// Modal Delete
const modalDelete = document.querySelector('#modal-delete');
$('#tabla-frases').on('click', '.btn-delete-open-modal', function () {
    itemIdToDelete = $(this).data('id');
    modalDelete.showModal();
});
document.querySelector('#btn-delete-close-modal').addEventListener('click', () => {
    modalDelete.close();
});
// Modal Edit
const modalEdit = document.querySelector('#modal-edit');
$('#tabla-frases').on('click', '.btn-edit-open-modal', function () {
    itemIdToEdit = $(this).data('id');
    currentImageFileName = $(this).data('file');
    db.collection("frases").doc(itemIdToEdit).get().then((doc) => {
        const data = doc.data();
        document.getElementById('edit-frase').value = data.frase;
        document.getElementById('edit-autor').value = data.autor;
        if (currentImageFileName) {
            const fileRef = storage.ref().child(currentImageFileName);
            fileRef.getDownloadURL().then((url) => {
                const preview = document.getElementById('preview-imagen-edit');
                preview.src = url;
                preview.classList.remove('hidden');
            }).catch((error) => {
                // console.error('Error al obtener la URL de la imagen:', error);
            });
        }
    }).catch((error) => {
        // console.error('Error al obtener los datos del documento:', error);
    });
    modalEdit.showModal();
});
document.querySelector('#btn-edit-close-modal').addEventListener('click', () => {
    modalEdit.close();
});

// AUTENTIFICACION DE USUARIOS
function observador() {
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            if (!user.emailVerified) {
                window.location.href = "/";
            }
            console.log('Usuario Activo: ' + user.email);
            console.log('Usuario Verificado: ' + user.emailVerified);
        } else {
            console.log('No existe usuario activo.');
            window.location.href = "/";
        }
    });
}
observador();
function logout() {
    firebase.auth().signOut()
        .then(() => {
            console.log('Cerrando...');
        })
        .catch((error) => {
            console.log(error);
        });
}