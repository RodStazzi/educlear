let studentsData = [];
const API_BASE = 'https://innocent-lucina-rodofostazzi-be9644fc.koyeb.app/';

document.getElementById('showAttendanceButton').addEventListener('click', () => {
  document.querySelector('.attendance-button-container').style.display = 'none';
  document.querySelector('.attendance-container').style.display = 'block';
  fetchStudentData();
});

document.getElementById('closeAttendanceButton').addEventListener('click', () => {
  document.querySelector('.attendance-button-container').style.display = 'block';
  document.querySelector('.attendance-container').style.display = 'none';
  //fetchStudentData();
});

async function fetchStudentData(authToken) {
  try {
      const response = await fetch(`${API_BASE}v1/alumnos`, {
          headers: {
              'Authorization': `Bearer ${window.authToken}`,
          },
      });

      if (response.ok) {
          studentsData = await response.json();
          renderAttendanceTable();
      } else {
          alert('Failed to fetch student data.');
      }
  } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while fetching student data.');
  }
}

function renderAttendanceTable() {
  const tableBody = document.getElementById('attendanceTableBody');
  tableBody.innerHTML = '';

  studentsData.forEach(student => {
      const row = document.createElement('tr');
      
      const nameCell = document.createElement('td');
      nameCell.textContent = student.nombre;
      row.appendChild(nameCell);

      const surnameCell = document.createElement('td');
      surnameCell.textContent = student.apellido;
      row.appendChild(surnameCell);

      const attendancesCell = document.createElement('td');
      const attendancesList = document.createElement('ul');
      attendancesList.classList.add('list-unstyled');

      student.asistencias.forEach(attendance => {
          if (attendance.id_asistencia !== 0) {
              const listItem = document.createElement('li');
              listItem.textContent = `${attendance.fecha}: 1era: ${attendance.presentePrimera ? 'Si' : 'No'}, 2do: ${attendance.presenteSegunda ? 'Si' : 'No'}`;
              attendancesList.appendChild(listItem);
          }
      });

      attendancesCell.appendChild(attendancesList);
      row.appendChild(attendancesCell);

      const actionsCell = document.createElement('td');
      const addButton = document.createElement('button');
      const addButtonElim = document.createElement('button');
      addButton.textContent = 'Agregar/Modificar/Eliminar Asistencia';
      addButton.classList.add('btn', 'btn-sm', 'tur-btn');
      addButton.addEventListener('click', () => showAttendanceModal(student));
      actionsCell.appendChild(addButton);
      row.appendChild(actionsCell);

      tableBody.appendChild(row);
  });
}

function showAttendanceModal(student) {
  const modalHtml = `
      <div class="modal fade" id="attendanceModal" tabindex="-1" aria-hidden="true">
          <div class="modal-dialog">
              <div class="modal-content">
                  <div class="modal-header">
                      <h5 class="modal-title">Agregar/Modificar Asistencia para ${student.nombre} ${student.apellido}</h5>
                      <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                  </div>
                  <div class="modal-body">
                      <form id="attendanceForm">
                          <div class="mb-3">
                              <label for="attendanceDate" class="form-label">Fecha</label>
                              <input type="date" class="form-control" id="attendanceDate" required>
                          </div>
                          <div class="mb-3 form-check">
                              <input type="checkbox" class="form-check-input" id="presentePrimera">
                              <label class="form-check-label" for="presentePrimera">Presente (1er)</label>
                          </div>
                          <div class="mb-3 form-check">
                              <input type="checkbox" class="form-check-input" id="presenteSegunda">
                              <label class="form-check-label" for="presenteSegunda">Presente (2do)</label>
                          </div>
                          <div class="mb-3 form-check">
                              <input type="checkbox" class="form-check-input" id="pagado">
                              <label class="form-check-label" for="pagado">Pagado</label>
                          </div>
                      </form>
                  </div>
                  <div class="modal-footer">
                      <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                      <button type="button" class="btn tur-btn" onclick="submitAttendance(${student.id_alumno})">Agregar/Modificar</button>
                      <button type="button" class="btn tur-btn" onclick="elimAttendance(${student.id_alumno})">Eliminar</button>
                  </div>
              </div>
          </div>
      </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHtml);
  const modal = new bootstrap.Modal(document.getElementById('attendanceModal'));
  modal.show();

  document.getElementById('attendanceModal').addEventListener('hidden.bs.modal', function () {
      this.remove();
  });
}

window.submitAttendance = async function submitAttendance(studentId) {
  const date = document.getElementById('attendanceDate').value;
  const presentePrimera = document.getElementById('presentePrimera').checked;
  const presenteSegunda = document.getElementById('presenteSegunda').checked;
  const pagado = document.getElementById('pagado').checked;

  const student = studentsData.find(s => s.id_alumno === studentId);
  const existingAttendance = student.asistencias.find(a => a.fecha === date);
  let response = null;

  if (!existingAttendance) {
    response = await fetch(`${API_BASE}v1/idalumnocurso/${studentId}`, {
    method: 'GET', // Método de la solicitud
    headers: {
        'Authorization': `Bearer ${window.authToken}`,
        'Content-Type': 'application/json' // Tipo de contenido
    }
});
    const data = await response.json();
    studentId = data;
  }



  let url = `${API_BASE}v1/insertaAsistencia/${studentId}`;
  let method = 'POST';
  let body = {
      fecha: date,
      presentePrimera,
      presenteSegunda,
      pagado
  };

  if (existingAttendance) {
      body.idAsistencia = existingAttendance.id_asistencia;
      studentId = existingAttendance.id_alumno_curso;
      url = `${API_BASE}v1/modificaAsistencia/${studentId}`;
      method = 'PUT';
      console.log('existingAttendance', existingAttendance)
      console.log('studentId', studentId)

  } 

  try {
    console.log('body ', body)
      const response = await fetch(url, {
          method: method,
          headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Authorization': `Bearer ${window.authToken}`,
          },
          body: new URLSearchParams(body),
      });

      if (response.ok) {
          alert('Asistencia enviada exitosamente');
          fetchStudentData();
          bootstrap.Modal.getInstance(document.getElementById('attendanceModal')).hide();
      } else {
          alert('Falló el envpio de la asistencia');
      }
  } catch (error) {
      console.error('Error:', error);
      alert('Un error ha ocurrido mientras se enviaba la asistencia');
  }
}

window.elimAttendance = async function elimAttendance(studentId) {
  const date = document.getElementById('attendanceDate').value;
  const student = studentsData.find(s => s.id_alumno === studentId);
  const existingAttendance = student.asistencias.find(a => a.fecha === date);

  if (!existingAttendance) {
      alert('No se encontró una asistencia para esta fecha');
      return;
  }

  const url = `${API_BASE}v1/borrarAsistencia/${existingAttendance.id_asistencia}`;
  const method = 'DELETE';

  try {
      const response = await fetch(url, {
          method: method,
          headers: {
              'Authorization': `Bearer ${window.authToken}`,
          },
      });

      if (response.ok) {
          alert('Asistencia eliminada exitosamente');
          await fetchStudentData();
          bootstrap.Modal.getInstance(document.getElementById('attendanceModal')).hide();
      } else {
          const errorData = await response.json();
          alert(`Error al eliminar la asistencia: ${errorData.message || response.statusText}`);
      }
  } catch (error) {
      console.error('Error:', error);
      alert('Ocurrió un error al eliminar la asistencia');
  }
}
