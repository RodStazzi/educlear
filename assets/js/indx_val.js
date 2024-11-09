function validarRut(rut) {
    // Limpiar el rut de puntos y guión
    rut = rut.replace(/\./g, '').replace('-', '');
    
    // Validar formato
    if (!/^[0-9]{7,8}[0-9k]$/i.test(rut)) {
        return false;
    }

    // Obtener dígito verificador
    const dv = rut.slice(-1).toUpperCase();
    // Obtener cuerpo del RUT
    const rutBody = rut.slice(0, -1);
    
    // Calcular dígito verificador esperado
    let suma = 0;
    let multiplicador = 2;
    
    // Calcular suma ponderada
    for (let i = rutBody.length - 1; i >= 0; i--) {
        suma += Number(rutBody[i]) * multiplicador;
        multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
    }
    
    // Calcular dígito verificador esperado
    const dvEsperado = 11 - (suma % 11);
    let dvCalculado;
    
    if (dvEsperado === 11) dvCalculado = '0';
    else if (dvEsperado === 10) dvCalculado = 'K';
    else dvCalculado = String(dvEsperado);
    
    // Comparar dígito verificador calculado con el proporcionado
    return dv === dvCalculado;
}

// Función para formatear RUT mientras se escribe
function formatearRut(rut) {
    // Eliminar puntos y guión
    let valor = rut.replace(/\./g, '').replace('-', '');
    
    // Eliminar letras que no sean 'k'
    valor = valor.replace(/[^0-9k]/gi, '');
    
    // Agregar guión antes del dígito verificador
    if (valor.length > 1) {
        valor = valor.slice(0, -1) + '-' + valor.slice(-1);
    }
    
    return valor;
}

// Agregar validación a los campos de RUT
document.addEventListener('DOMContentLoaded', function() {
    // Para el formulario de login
    const usernameInput = document.getElementById('username');
    if (usernameInput) {
        usernameInput.addEventListener('input', function() {
            this.value = formatearRut(this.value);
        });
        
        usernameInput.addEventListener('blur', function() {
            if (!validarRut(this.value)) {
                this.classList.add('is-invalid');
                if (!this.nextElementSibling) {
                    const feedback = document.createElement('div');
                    feedback.className = 'invalid-feedback';
                    feedback.textContent = 'RUT inválido. Formato requerido: 11111111-1';
                    this.parentNode.appendChild(feedback);
                }
            } else {
                this.classList.remove('is-invalid');
                const feedback = this.nextElementSibling;
                if (feedback && feedback.className === 'invalid-feedback') {
                    feedback.remove();
                }
            }
        });
    }
    
    // Para el modal de agregar estudiante
    const addRutInput = document.getElementById('addRut');
    if (addRutInput) {
        addRutInput.addEventListener('input', function() {
            this.value = formatearRut(this.value);
        });
        
        addRutInput.addEventListener('blur', function() {
            if (!validarRut(this.value)) {
                this.classList.add('is-invalid');
                if (!this.nextElementSibling) {
                    const feedback = document.createElement('div');
                    feedback.className = 'invalid-feedback';
                    feedback.textContent = 'RUT inválido. Formato requerido: 11111111-1';
                    this.parentNode.appendChild(feedback);
                }
            } else {
                this.classList.remove('is-invalid');
                const feedback = this.nextElementSibling;
                if (feedback && feedback.className === 'invalid-feedback') {
                    feedback.remove();
                }
            }
        });
    }
    
    // Para el modal de actualizar estudiante
    const updateRutInput = document.getElementById('updateRut');
    if (updateRutInput) {
        updateRutInput.addEventListener('input', function() {
            this.value = formatearRut(this.value);
        });
        
        updateRutInput.addEventListener('blur', function() {
            if (!validarRut(this.value)) {
                this.classList.add('is-invalid');
                if (!this.nextElementSibling) {
                    const feedback = document.createElement('div');
                    feedback.className = 'invalid-feedback';
                    feedback.textContent = 'RUT inválido. Formato requerido: 11111111-1';
                    this.parentNode.appendChild(feedback);
                }
            } else {
                this.classList.remove('is-invalid');
                const feedback = this.nextElementSibling;
                if (feedback && feedback.className === 'invalid-feedback') {
                    feedback.remove();
                }
            }
        });
    }
});
