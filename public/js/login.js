document.addEventListener("DOMContentLoaded", () => {
    observador();

    // REDIRECCIONAR
    document.querySelector('#form-login').addEventListener('submit', (event) => {
        event.preventDefault();
        login();
    });
    document.querySelector('#form-login .btn-cancelar').addEventListener('click', () => {
        window.location.href = "/";
    });
});

// Muestra si hay una cuenta activa en el sitio web
function observador() {
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            console.log('Usuario Activo: ' + user.email);
            console.log('Usuario Verificado: ' + user.emailVerified);
            if (user.emailVerified) {
                window.location.href = "dashboard.html";
            }
        } else {
            console.log('No existe usuario activo.');
        }
    });
}

// Registrar nuevos usuarios
function signup() {
    const correo = document.getElementById('correo').value;
    const pass = document.getElementById('pass').value;
    firebase.auth().createUserWithEmailAndPassword(correo, pass)
        .then((userCredential) => {
            alert('Se ha creado un nuevo usuario. Por favor, verifica tu correo.');
            verificar();
            document.getElementById('correo').value = '';
            document.getElementById('pass').value = '';
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.log(errorCode);
            console.log(errorMessage);
        });
}

// Enviar correo de verificación de cuenta al usuario
function verificar() {
    firebase.auth().currentUser.sendEmailVerification()
        .then(() => {
            console.log('Enviando correo...');
        })
        .catch((error) => {
            console.log(error);
        });
}

// Iniciar sesión usuarios existentes
function login() {
    const correo = document.getElementById('correo').value;
    const pass = document.getElementById('pass').value;
    firebase.auth().signInWithEmailAndPassword(correo, pass)
        .then((userCredential) => {
            var user = userCredential.user;
            window.location.href = "dashboard.html";
        })
        .catch((error) => {
            var errorCode = error.code;
            var errorMessage = error.message;
            console.log(errorCode);
            console.log(errorMessage);
            alert('No es posible acceder.');
        });
}

// Cerrar sesión
function logout() {
    firebase.auth().signOut()
        .then(() => {
            console.log('Cerrando...');
        })
        .catch((error) => {
            console.log(error);
        });
}