let idAlumnoCurso;
//const API_BASE = 'https://innocent-lucina-rodofostazzi-be9644fc.koyeb.app/';


document.getElementById('closeAlumnBtn').addEventListener('click', () => {
  document.querySelector('.attendance-button-container').style.display = 'block';
  document.querySelector('.attendance-container').style.display = 'none';
  document.getElementById('studentTable').classList.add('hidden');
  document.getElementById('mainContent').style.display = 'none';
    document.getElementById('closeAlumnBtn').style.display = 'none';
  //fetchStudentData();
});


document.getElementById('loadStudents').addEventListener('click', async () => {
  try {
    document.getElementById('mainContent').style.display = 'block';
    document.getElementById('closeAlumnBtn').style.display = 'block';
    document.querySelector('.attendance-button-container').style.display = 'none';
    const response = await fetch(`${API_BASE}v1/alumnos`, {
      headers: { 'Authorization': `Bearer ${window.authToken}` }
    });

    if (response.ok) {
      const students = await response.json();
      const tableBody = document.getElementById('studentDatas');
      tableBody.innerHTML = '';

      students.forEach(student => {
        const row = tableBody.insertRow();
        row.innerHTML = `
                        <td>${student.nombre}</td>
                        <td>${student.apellido}</td>
                        <td>${student.correo}</td>
                        <td>${student.fecha_nacimiento}</td>
                        <td>${student.estado}</td>
                        <td>
                            <div class="button-container">
                                <button class="btn btn-sm btn-info semaforo-student" data-id="${student.rut}">Semáforo</button>
                                <button class="btn btn-sm tur-btn update-student" data-rut="${student.rut}">Actualizar</button>
                                <button class="btn btn-sm btn-secondary delete-student" data-id="${student.id_alumno}">Eliminar</button>
                            </div>
                        </td>
                    `;
      });

      document.getElementById('studentTable').classList.remove('hidden');
    } else {
      alert('Fallo al intentar leer estudiantes. Por favor intente de nuevo.');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Ha ocurrido un error.');
  }
});

// Add Student
document.getElementById('addStudent').addEventListener('click', () => {
  new bootstrap.Modal(document.getElementById('addStudentModal')).show();
});

document.getElementById('submitAddStudent').addEventListener('click', async () => {
  const nombre = document.getElementById('addNombre').value;
  const apellido = document.getElementById('addApellido').value;
  const correo = document.getElementById('addCorreo').value;
  const fecha_nacimiento = document.getElementById('addFechaNacimiento').value;
  const cuiper = (document.getElementById('addCuiper')).checked;
  const rut = document.getElementById('addRut').value;

  try {
    const response = await fetch(`${API_BASE}v1/insertarAlumno`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${window.authToken}`
      },
      body: JSON.stringify({
        nombre,
        apellido,
        correo,
        fecha_nacimiento,
        notas: [],
        asistencias: [],
        rut,
        cuiper
      })
    });

    if (response.ok) {
      alert('El estudiante se ha agregado exitosamente');
      bootstrap.Modal.getInstance(document.getElementById('addStudentModal')).hide();
      document.getElementById('loadStudents').click();
    } else {
      alert('Fallo al intentar agregar un estudiante. Por favor intente de nuevo.');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Ha ocurrido un error.');
  }
});

// Update Student
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('update-student')) {
    const studentRut = e.target.getAttribute('data-rut');
    console.log(studentRut)
    openUpdateModal(studentRut);
  }
});

async function openUpdateModal(studentId) {
  try {
    const [studentResponse, coursesResponse, statusResponse] = await Promise.all([
      fetch(`${API_BASE}v1/alumno/${studentId}`, { headers: { 'Authorization': `Bearer ${window.authToken}` } }),
      fetch(`${API_BASE}v1/cursos`, { headers: { 'Authorization': `Bearer ${window.authToken}` } }),
      fetch(`${API_BASE}v1/estados`, { headers: { 'Authorization': `Bearer ${window.authToken}` } })
    ]);

    if (studentResponse.ok && coursesResponse.ok && statusResponse.ok) {
      const student = await studentResponse.json();
      const courses = await coursesResponse.json();
      const statuses = await statusResponse.json();
      console.log(student)
      idAlumnoCurso = encontrarIdAlumnoCurso(student)
      document.getElementById('updateIdAlumno').value = student.id_alumno;
      document.getElementById('updateNombre').value = student.nombre;
      document.getElementById('updateApellido').value = student.apellido;
      document.getElementById('updateCorreo').value = student.correo;
      document.getElementById('updateFechaNacimiento').value = student.fecha_nacimiento;

      document.getElementById('updateRut').value = student.rut;

// Verificar si student.cuiper es booleano
  if (typeof student.cuiper === 'boolean') {
    document.getElementById('updateCuiper').checked = student.cuiper;
  } else {
    document.getElementById('updateCuiper').value = student.cuiper;
  }

      const courseSelect = document.getElementById('updateCurso');
      courseSelect.innerHTML = courses.map(course => `<option value="${course.id_curso}">${course.nombre_curso}</option>`).join('');

      const statusSelect = document.getElementById('updateEstado');
      statusSelect.innerHTML = statuses.map(status => `<option value="${status.id_estado_alumno_curso}">${status.descripcion}</option>`).join('');

      new bootstrap.Modal(document.getElementById('updateStudentModal')).show();
    } else {
      alert('Fallo al intentar leer datos del estudiante. Por favor intente de nuevo.');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Ha ocurrido un error.');
  }
}

document.getElementById('submitUpdateStudent').addEventListener('click', async () => {
  const id_alumno = document.getElementById('updateIdAlumno').value;
  const nombre = document.getElementById('updateNombre').value;
  const apellido = document.getElementById('updateApellido').value;
  const correo = document.getElementById('updateCorreo').value;
  const fecha_nacimiento = document.getElementById('updateFechaNacimiento').value;
  const id_curso = document.getElementById('updateCurso').value;
  const id_estado_alumno_curso = document.getElementById('updateEstado').value;
  const cuiper = document.getElementById('updateCuiper').checked;
  const rut = document.getElementById('updateRut').value;
  const fechaNacimiento = fecha_nacimiento;
  try {

    const response = await fetch(`${API_BASE}v1/modificaAlumno/${id_alumno}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${window.authToken}`
      },
      body: JSON.stringify({
        nombre,
        apellido,
        correo,
        fechaNacimiento,
        cuiper,
        rut
        //id_curso,
        //id_estado_alumno_curso
      })
    });
    if (idAlumnoCurso != 0) {
      try {
        const queryParams = new URLSearchParams({
          idAlumno: id_alumno,
          idCurso: id_curso,
          idEstadoAlumnoCurso: id_estado_alumno_curso
        });

        const response2 = await fetch(`${API_BASE}v1/modificaAlumnoCurso/${idAlumnoCurso}?${queryParams.toString()}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${window.authToken}`
          }
        });

        if (!response2.ok) {
          const errorText = await response2.text();  // Obtiene el texto de error
          throw new Error(`Error ${response2.status}: ${errorText}`);
        }

        // Verificar si la respuesta es JSON
        const contentType = response2.headers.get('Content-Type');
        let data;
        if (contentType && contentType.includes('application/json')) {
          data = await response2.json();  // Parsear como JSON si el contenido es JSON
        } else {
          data = await response2.text();  // Si no es JSON, obtén el texto directamente
        }

        console.log('Response data:', data);
      } catch (error) {
        console.error('Error al modificar AlumnoCurso:', error);
      }
    } else {
      try {
        const queryParams = new URLSearchParams({
          idCurso: id_curso,
          idEstadoAlumnoCurso: id_estado_alumno_curso
        });

        const response3 = await fetch(`${API_BASE}v1/insertaAlumnoCurso/${id_alumno}?${queryParams.toString()}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${window.authToken}`
          }
        });

        if (!response3.ok) {
          const errorText = await response2.text();  // Obtiene el texto de error
          throw new Error(`Error ${response2.status}: ${errorText}`);
        }

        // Verificar si la respuesta es JSON
        const contentType = response3.headers.get('Content-Type');
        let data;
        if (contentType && contentType.includes('application/json')) {
          data = await response3.json();  // Parsear como JSON si el contenido es JSON
        } else {
          data = await response3.text();  // Si no es JSON, obtén el texto directamente
        }

        console.log('Response data:', data);
      } catch (error) {
        console.error('Error al insertar AlumnoCurso:', error);
      }
    }



    if (response.ok) {
      alert('El estudiante se ha modificado exitosamente');
      bootstrap.Modal.getInstance(document.getElementById('updateStudentModal')).hide();
      document.getElementById('loadStudents').click();
    } else {
      alert('Fallo al intentar modificar estudiante. Por favor intente de nuevo.');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Ha ocurrido un error.');
  }


});

// Delete Student
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('delete-student')) {
    const studentId = e.target.getAttribute('data-id');
    if (confirm('¿Está seguro de querer borrar a este pobre he indefenso estudiante?')) {
      deleteStudent(studentId);
    }
  }
});

async function deleteStudent(studentId) {
  try {
    const response = await fetch(`${API_BASE}v1/borrarAlumno/${studentId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${window.authToken}` }
    });

    if (response.ok) {
      alert('El estudiante se ha eliminado exitosamente');
      document.getElementById('loadStudents').click();
    } else {
      alert('Fallo al intentar eliminar estudiante. Por favor intente de nuevo.');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Ha ocurrido un error.');
  }
}


function encontrarIdAlumnoCurso(alumno) {
  let idAlumnoCurso = null;

  // Recorrer notas
  for (let nota of alumno.notas) {
    if (nota.id_alumno_curso !== null) {
      idAlumnoCurso = nota.id_alumno_curso;
      break;
    }
  }

  // Si no se encontró en notas, recorrer asistencias
  if (idAlumnoCurso === null) {
    for (let asistencia of alumno.asistencias) {
      if (asistencia.id_alumno_curso !== null) {
        idAlumnoCurso = asistencia.id_alumno_curso;
        break;
      }
    }
  }

  return idAlumnoCurso;
}




const trafficLightModal = `
<div class="modal fade" id="semaforoModal" tabindex="-1">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">Análisis de Semáforo</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
      </div>
      <div class="modal-body">
        <div class="mb-4">
          <h6>Semáforo de Asistencia</h6>
          <div id="asistenciaSemaforo" class="p-2 rounded mb-2"></div>
          <small class="text-muted">
            Verde: Todas las asistencias presentes (factible término curso)<br>
            Amarillo: 2 asistencias seguidas ausente <br>
            Rojo: 3 o más asistencias seguidas ausente (probable deserción)
          </small>
        </div>
        <div class="mb-4">
          <h6>Semáforo de Calificaciones</h6>
          <div id="calificacionesSemaforo" class="p-2 rounded mb-2"></div>
          <small class="text-muted">
            Verde: Menos del 30% de calificaciones bajo 4.0<br>
            Amarillo: 30% de calificaciones bajo 4.0 (ayuda esporádica)<br>
            Rojo: 50% o más de calificaciones bajo 4.0 (ayuda inmediata)
          </small>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
      </div>
    </div>
  </div>
</div>`;

document.body.insertAdjacentHTML('beforeend', trafficLightModal);

document.addEventListener('click', (e) => {
  if (e.target.classList.contains('semaforo-student')) {
    const studentId = e.target.getAttribute('data-id');
    showTrafficLightAnalysis(studentId);
  }
});

async function showTrafficLightAnalysis(studentId) {
  try {
    const response = await fetch(`${API_BASE}v1/alumno/${studentId}`, {
      headers: { 'Authorization': `Bearer ${window.authToken}` }
    });

    if (response.ok) {
      const student = await response.json();
      
      // Análisis de asistencias
      let asistenciaColor = 'green';
      let faltasConsecutivas = 0;
      let maxFaltasConsecutivas = 0;

      student.asistencias.sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
        .forEach(asistencia => {
          if (!asistencia.presentePrimera || !asistencia.presenteSegunda) {
            faltasConsecutivas++;
            maxFaltasConsecutivas = Math.max(maxFaltasConsecutivas, faltasConsecutivas);
          } else {
            faltasConsecutivas = 0;
          }
        });

      if (maxFaltasConsecutivas >= 3) asistenciaColor = 'red';
      else if (maxFaltasConsecutivas === 2) asistenciaColor = 'yellow';

      // Análisis de calificaciones
      const notasBajo4 = student.notas.filter(nota => nota.nota < 4.0).length;
      const porcentajeBajo4 = (notasBajo4 / student.notas.length) * 100;
      
      let calificacionesColor = 'green';
      if (porcentajeBajo4 >= 50) calificacionesColor = 'red';
      else if (porcentajeBajo4 >= 30) calificacionesColor = 'yellow';

      // Actualizar modal
      document.getElementById('asistenciaSemaforo').style.backgroundColor = asistenciaColor;
      document.getElementById('calificacionesSemaforo').style.backgroundColor = calificacionesColor;

      new bootstrap.Modal(document.getElementById('semaforoModal')).show();
    } else {
      alert('Failed to load student data. Please try again.');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('An error occurred. Please try again.');
  }
}