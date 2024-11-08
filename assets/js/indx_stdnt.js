        // Configuración de la API
        window.API_BASE = 'https://whispering-nikki-rosta-7103c5b5.koyeb.app/';
        //window.API_BASE = 'http://localhost:8000/';
        let authToken = '';
        window.authToken = '';

        // Elementos del DOM
        const loginForm = document.getElementById('loginForm');
        const loginSection = document.getElementById('loginSection');
        const studentSection = document.getElementById('studentSection');
        const studentData = document.getElementById('studentData');
        const logoutBtn = document.getElementById('logoutBtn');
        const tableBody = document.getElementById('studentData');
        const generateSubsidiesBtn = document.getElementById('generateSubsidiesBtn');
        const subsidiesTables = document.getElementById('subsidiesTables');
        let studentInfo;

        const registerSection = document.getElementById('registerSection');
        const registerForm = document.getElementById('registerForm');
        const showRegisterLink = document.getElementById('showRegisterLink');
        const backToLoginLink = document.getElementById('backToLoginLink');

        // Show/hide register form
        showRegisterLink.addEventListener('click', (e) => {
            e.preventDefault();
            loginSection.classList.add('hidden');
            registerSection.classList.remove('hidden');
        });

        backToLoginLink.addEventListener('click', (e) => {
            e.preventDefault();
            registerSection.classList.add('hidden');
            loginSection.classList.remove('hidden');
        });


        function showLoginSection() {
            loginSection.classList.remove('hidden');
            studentSection.classList.add('hidden');
            subsidiesTables.classList.add('hidden');
            document.getElementById('loginForm').reset();
        }
        function showLoginFromAdmin() {
            document.querySelector('.login-container').style.display = 'block'; // Mostrar el login
            document.querySelector('.attendance-button-container').style.display = 'none';
            document.getElementById('loginForm').reset();
        }
        // Evento de envío del formulario de login
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            try {
                const response = await fetch(`${API_BASE}auth/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ username, password }),
                });
                console.log('response ',response);
                if (!response.ok) {
                    alert('Acceso no autorizado');
                   return new Error('Error en la autenticación');
                }

                const data = await response.json();

                authToken = data.jwt;
                window.authToken = data.jwt;
                let adm = await fecthAdmin(authToken);

                if (authToken && !adm) {
                    loginSection.classList.add('hidden');
                    studentSection.classList.remove('hidden');

                    fetchStudentData(username);
                } else if (authToken && adm) {
                    loginSection.classList.add('hidden');

                    
                    document.querySelector('.login-container').style.display = 'none';
                    document.querySelector('.attendance-button-container').style.display = 'block';
                    //document.getElementById('dashboard').style.display = 'block';
                    

                    document.getElementById('mainContent').classList.remove('hidden');

                } else {
                    alert('Acceso no autorizado');
                }

            } catch (error) {
                console.error('Error:', error);
                alert('Error en el inicio de sesión');
            }
        });
        
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const user = {
                username: document.getElementById('newUsername').value,
                password: document.getElementById('newPassword').value
            };

            try {
                console.log('Sending registration request:', user);
                const response = await fetch(`${API_BASE}auth/register`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(user),
                });

                console.log('Registration response status:', response.status);

                if (!response.ok) {
                    let errorMessage = 'Error en el registro';
                    if (responseData) {
                        errorMessage = typeof responseData === 'string' ? responseData : 
                                      responseData.message || errorMessage;
                    }
                    throw new Error(errorMessage);
                }

                alert('Registro exitoso. Por favor, inicie sesión.');
                registerSection.classList.add('hidden');
                loginSection.classList.remove('hidden');
                registerForm.reset();
            } catch (error) {
                console.error('Registration error:', error);
                alert(registerAlert, error.message || 'Error en el registro');
            }
        });


        // Función para obtener y mostrar los datos del estudiante
        async function fetchStudentData(username) {
            try {
                  const response = await fetch(`${API_BASE}v1/alumno/${username}`, {
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                    },
                });

                if (!response.ok) {
                    throw new Error('Error al obtener los datos del estudiante');
                }

                 studentInfo = await response.json();
                displayStudentInfo(studentInfo);
            } catch (error) {
                console.error('Error:', error);
                alert('Error al cargar los datos del estudiante');
            }
        }

        async function fecthAdmin(authToken) {
            try {
                  const response = await fetch(`${API_BASE}v1/test/protected`, {
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                    },
                });

                if (!response.ok) {
                    return false;
                } else {
                    return true;
                }

            } catch (error) {
                console.error('Error:', error);
                alert('Error al cargar tkn ');
            }
        }

        // Función para mostrar la información del estudiante
        function displayStudentInfo(info) {
            const html = `
                <div class="card mb-4">
                    <div class="card-body">
                        <h3 class="card-title">${info.nombre} ${info.apellido}</h3>
                        <p class="card-text"><strong>ID:</strong> ${info.id_alumno}</p>
                        <p class="card-text"><strong>Correo:</strong> ${info.correo}</p>
                        <p class="card-text"><strong>Fecha de nacimiento:</strong> ${info.fecha_nacimiento}</p>
                        <p class="card-text"><strong>Estado:</strong> ${info.estado}</p>
                    </div>
                </div>

                <div class="card mb-4">
                    <div class="card-body">
                        <h4 class="card-title">Notas</h4>
                        <div class="table-responsive">
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th>ID Nota</th>
                                        <th>ID Alumno Curso</th>
                                        <th>Nota</th>
                                        <th>Fecha</th>
                                    </tr>
                                </thead>
                                <tbody>
  ${info.notas.filter(nota => nota.id_nota === 0)
    .map(nota => `
      <tr>
        <td>${nota.id_nota}</td>
        <td>${nota.id_alumno_curso}</td>
        <td>${nota.nota}</td>
        <td>${nota.fecha || 'N/A'}</td>
      </tr>
    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div class="card">
                    <div class="card-body">
                        <h4 class="card-title">Asistencias</h4>
                        <div class="table-responsive">
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th>ID Asistencia</th>
                                        <th>ID Alumno Curso</th>
                                        <th>Primera</th>
                                        <th>Segunda</th>
                                        <th>Fecha</th>
                                        <th>Pagado</th>
                                    </tr>
                                </thead>
                                <tbody>
  ${info.asistencias.filter(asistencia => asistencia.id_asistencia === 0)
    .map(asistencia => `
      <tr>
        <td>${asistencia.id_asistencia}</td>
        <td>${asistencia.id_alumno_curso}</td>
        <td>${asistencia.presentePrimera ? '✓' : '✗'}</td>
        <td>${asistencia.presenteSegunda ? '✓' : '✗'}</td>
        <td>${asistencia.fecha || 'N/A'}</td>
        <td>${asistencia.pagado ? '✓' : '✗'}</td>
      </tr>
    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            `;

            studentData.innerHTML = html;
        }

       // Función para generar las tablas de subsidios
       function generateSubsidiesTables() {
        if (!studentInfo) {
            alert('No hay información del estudiante disponible');
            return;
        }

        const attendanceSubsidies = studentInfo.asistencias.map(asistencia => {
            let subsidio = 0;
            if (asistencia.presentePrimera && asistencia.presenteSegunda) {
                subsidio = 1000;
            }
            if (studentInfo.cuiper) {
                subsidio += 1000;
            }
            return {
                ...asistencia,
                subsidio
            };
        });

        const paidSubsidies = attendanceSubsidies.filter(a => a.pagado);
        const unpaidSubsidies = attendanceSubsidies.filter(a => !a.pagado && a.subsidio > 0);

        const gradeSubsidies = studentInfo.notas.map(nota => {
            let subsidio = 0;
            if (nota.nota >= 6) {
                subsidio = 2000;
            } else if (nota.nota >= 4 && nota.nota <= 5) {
                subsidio = 1000;
            }
            return {
                ...nota,
                subsidio
            };
        }).filter(n => n.subsidio > 0);

        const totalPaidSubsidies = paidSubsidies.reduce((total, a) => total + a.subsidio, 0);
        const totalUnpaidSubsidies = unpaidSubsidies.reduce((total, a) => total + a.subsidio, 0);
        const totalGradeSubsidies = gradeSubsidies.reduce((total, n) => total + n.subsidio, 0);

        const html = `
            <h3>Reglas de Subsidios</h3>
            <ul>
                <li>Por cada día con PresentePrimera y PresenteSegunda en ✓, se pagarán 1000 pesos.</li>
                <li>Si el estudiante tiene Cuiper 'Cuidado de persona', se agregan 1000 pesos adicionales por cada asistencia.</li>
                <li>Por calificaciones:
                    <ul>
                        <li>6 o más: 2000 pesos</li>
                        <li>Entre 4 y 5: 1000 pesos</li>
                    </ul>
                </li>
            </ul>
            <p><strong>'Cuidado de persona' del estudiante:</strong> ${studentInfo.cuiper ? 'Sí' : 'No'}</p>

            <h3>Subsidios por Asistencia</h3>
            <h4>Pagados</h4>
            <table class="table">
                <thead>
                    <tr>
                        <th>ID Asistencia</th>
                        <th>Fecha</th>
                        <th>Subsidio</th>
                    </tr>
                </thead>
                <tbody>
                    ${paidSubsidies.map(a => `
                        <tr>
                            <td>${a.id_asistencia}</td>
                            <td>${a.fecha || 'N/A'}</td>
                            <td>$${a.subsidio}</td>
                        </tr>
                    `).join('')}
                    <tr>
                        <td colspan="2"><strong>Total</strong></td>
                        <td><strong>$${totalPaidSubsidies}</strong></td>
                    </tr>
                </tbody>
            </table>

            <h4>Por Pagar</h4>
            <table class="table">
                <thead>
                    <tr>
                        <th>ID Asistencia</th>
                        <th>Fecha</th>
                        <th>Subsidio</th>
                    </tr>
                </thead>
                <tbody>
                    ${unpaidSubsidies.map(a => `
                        <tr>
                            <td>${a.id_asistencia}</td>
                            <td>${a.fecha || 'N/A'}</td>
                            <td>$${a.subsidio}</td>
                        </tr>
                    `).join('')}
                    <tr>
                        <td colspan="2"><strong>Total</strong></td>
                        <td><strong>$${totalUnpaidSubsidies}</strong></td>
                    </tr>
                </tbody>
            </table>

            <h3>Subsidios por Calificación</h3>
            <table class="table">
                <thead>
                    <tr>
                        <th>ID Nota</th>
                        <th>Nota</th>
                        <th>Subsidio</th>
                    </tr>
                </thead>
                <tbody>
                    ${gradeSubsidies.map(n => `
                        <tr>
                            <td>${n.id_nota}</td>
                            <td>${n.nota}</td>
                            <td>$${n.subsidio}</td>
                        </tr>
                    `).join('')}
                    <tr>
                        <td colspan="2"><strong>Total</strong></td>
                        <td><strong>$${totalGradeSubsidies}</strong></td>
                    </tr>
                </tbody>
            </table>
        `;

        subsidiesTables.innerHTML = html;
        subsidiesTables.classList.remove('hidden');
    }

    // Evento para generar las tablas de subsidios
    generateSubsidiesBtn.addEventListener('click', generateSubsidiesTables);


        // Evento de cierre de sesión
        logoutBtn.addEventListener('click', () => {
            authToken = '';
            studentInfo = null;
            studentSection.classList.add('hidden');
            loginSection.classList.remove('hidden');
            document.getElementById('loginForm').reset();
            subsidiesTables.classList.add('hidden');
            showLoginSection();
        });
  
        document.getElementById('closeSesion').addEventListener('click', () => {
            showLoginFromAdmin();
          });
