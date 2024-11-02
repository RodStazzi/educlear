const API_BASE = 'https://innocent-lucina-rodofostazzi-be9644fc.koyeb.app/';
let authToken = '';


document.addEventListener('DOMContentLoaded', () => {
    const showNotesBtn = document.getElementById('showNotesBtn');
    const closeNotesBtn = document.getElementById('closeNotesBtn');
    showNotesBtn.addEventListener('click', fetchAndDisplayNotes);
    closeNotesBtn.addEventListener('click', closeDisplayNotes);
});



async function closeDisplayNotes() {

    const tableContainer = document.getElementById('notesTable');
    tableContainer.style.display = 'none';
    closeNotesBtn.style.display = 'none';
    document.querySelector('.attendance-button-container').style.display = 'block';
    document.getElementById('dashboard').style.display = 'none';

}

async function fetchAndDisplayNotes() {
    document.getElementById('dashboard').style.display = 'block';
    document.querySelector('.attendance-button-container').style.display = 'none';
    document.getElementById('showNotesBtn');

    closeNotesBtn.style.display = 'block';

    try {
        const response = await fetch(`${API_BASE}v1/alumnos`, {
            headers: {
                'Authorization': `Bearer ${window.authToken}`,
            },
        });

        if (response.ok) {
            const students = await response.json();
            displayNotesTable(students);
            loadTrabajos();
        } else {
            alert('Error al traer datos de estudiante.');
        }
    } catch (error) {
        console.error('Error trayendo datos de estudiante:', error);
        alert('Ha ocurrido un error.');
    }
}

function displayNotesTable(students) {
    const tableContainer = document.getElementById('notesTable');
    tableContainer.innerHTML = '';

    const table = document.createElement('table');
    table.className = 'table table-striped table-bordered';
    table.innerHTML = `
        <thead>
            <tr>
                <th>Nombre</th>
                <th>Apellido</th>
                <th>Notas</th>
                <th>Nueva Nota</th>
            </tr>
        </thead>
        <tbody>
        </tbody>
    `;

    const tbody = table.querySelector('tbody');

    students.forEach(student => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${student.nombre}</td>
            <td>${student.apellido}</td>
            <td>${formatNotes(student.notas)}</td>
            <td>${createNewNoteForm(student.id_alumno)}</td>
        `;
        tbody.appendChild(row);
    });

    tableContainer.appendChild(table);
    tableContainer.style.display = 'block';
}

function formatNotes(notes) {
    return notes
        .filter(note => note.id_nota !== 0)
        .map(note => `
            <div>
                ${note.nombre_trabajo}: ${note.nota} <br>
                [${note.fecha}]
                <button onclick="updateNote(${note.id_alumno_curso},${note.id_nota}, '${note.fecha}', '${note.nombre_trabajo}', ${note.nota})" class="btn btn-sm tur-btn ml-2">Editar</button>
                <button onclick="deleteNote(${note.id_nota})" class="btn btn-sm btn-outline-secondary ml-2">Borrar</button>
            </div>
        `)
        .join('');
}

function createNewNoteForm(studentId) {
    return `
        <form onsubmit="handleNewNote(event, ${studentId})">
            <input type="date" name="fecha" required class="form-control form-control-sm mb-1">
            <div class="d-flex mb-1">
                <input type="number" name="nota" step="0.1" min="0" max="10" required class="form-control form-control-sm me-1" style="width: 80px;">
        
                <select name="id_trabajo" id="trabajoDropdown-${studentId}" class="form-control form-control-sm" style="width: auto;">
                    <option value="" disabled selected>Seleccione un trabajo</option>
                </select>
            </div>

            <button type="submit" class="btn tur-btn btn-sm">Agregar Nota</button>
        </form>
    `;
}


async function loadTrabajos() {
    try {
        const response = await fetch(`${API_BASE}v1/trabajos`, {
            headers: { 'Authorization': `Bearer ${window.authToken}` }
        });
        const trabajos = await response.json();

        // Selecciona todos los selectores con name="id_trabajo" y llena cada uno
        document.querySelectorAll('select[name="id_trabajo"]').forEach(dropdown => {
            trabajos.forEach(trabajo => {
                const option = document.createElement("option");
                option.value = trabajo.id_trabajo;
                option.text = trabajo.nombre_trabajo;
                dropdown.appendChild(option);
            });
        });
    } catch (error) {
        console.error("Error al cargar trabajos:", error);
    }
}



window.handleNewNote  = async function handleNewNote(event, idAlumnoCurso) {
    event.preventDefault();
    const form = event.target;
    const fecha = form.fecha.value;
    const nota = form.nota.value;
    const id_trabajo = form.id_trabajo.value;
    const data = new URLSearchParams();
    data.append('fecha', fecha);
    data.append('nota', nota);
    data.append('id_trabajo', id_trabajo);

    try {
        const response = await fetch(`${API_BASE}v1/insertaNota/${idAlumnoCurso}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Bearer ${window.authToken}`,
            },
            body: data,
        });

        if (response.ok) {
            alert('Nota agregada exitosamente');
            fetchAndDisplayNotes();
        } else {
            alert('Error al agregar la nota. Por favor, intente nuevamente.');
        }
    } catch (error) {
        console.error('Error al agregar la nota:', error);
        alert('Ocurrió un error. Por favor, intente nuevamente.');
    }
}


window.updateNote  = async function updateNote(idAlumnoCurso, idNota, fecha, trabajo, nota) {
  const newNota = prompt(`Ingrese la nueva nota para ${trabajo} de la fecha ${fecha}:`, nota);
  if (newNota === null || newNota === '') return;
  const data = new URLSearchParams();
  data.append('idNota', idNota);
  data.append('fecha', fecha);
  data.append('nota', newNota);

  try {
      const response = await fetch(`${API_BASE}v1/modificaNota/${idAlumnoCurso}`, {
          method: 'PUT',
          headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Authorization': `Bearer ${window.authToken}`,
          },
          body: data,
      });

      if (response.ok) {
          alert('Nota actualizada exitosamente');
          fetchAndDisplayNotes();
      } else {
          const errorText = await response.text();
          console.error('Error response:', response.status, response.statusText, errorText);
          alert(`Error al actualizar la nota. Status: ${response.status}. Message: ${errorText}`);
      }
  } catch (error) {
      console.error('Error al actualizar la nota:', error);
      alert(`Ocurrió un error. Detalles: ${error.message}`);
  }

  // Log the request details for debugging
  console.log('Request details:', {
      url: `${API_BASE}v1/modificaNota/`,
      method: 'PUT',
      headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Bearer ${authToken}`,
      },
      body: data.toString(),
  });
}

window.deleteNote  = async function deleteNote(idNota) {
  
    const data = new URLSearchParams();
    data.append('idNota', idNota);



    try {
        const response = await fetch(`${API_BASE}v1/borrarNota/${idNota}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Bearer ${window.authToken}`,
            },
            body: data,
        });
  
        if (response.ok) {
            alert('Nota eliminada exitosamente');
            fetchAndDisplayNotes();
        } else {
            const errorText = await response.text();
            console.error('Error response:', response.status, response.statusText, errorText);
            alert(`Error al actualizar la nota. Status: ${response.status}. Message: ${errorText}`);
        }
    } catch (error) {
        console.error('Error al actualizar la nota:', error);
        alert(`Ocurrió un error. Detalles: ${error.message}`);
    }
  
    // Log the request details for debugging
    console.log('Request details:', {
        url: `${API_BASE}v1/modificaNota/`,
        method: 'PUT',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Bearer ${window.authToken}`,
        },
        body: data.toString(),
    });
  }
  
