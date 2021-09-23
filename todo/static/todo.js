const allOptions = document.querySelector('#all');
const inProgress = document.querySelector('#progress');
const completed = document.querySelector('#completed');
const input = document.querySelector('#input');
const ul = document.querySelector('#toDos');
const addBtn = document.querySelector('#add');
const saveBtn = document.querySelector('#save');
const cancelBtn = document.querySelector('#cancel');
let ids = [];

const getCookie = (name) => {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        // Does this cookie string begin with the name we want?
        if (cookie.substring(0, name.length + 1) === (name + '=')) {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
    }
  }
  return cookieValue;
}

const csrftoken = getCookie('csrftoken');

const deleteHandler = () => {
  const deleteBtn = document.querySelectorAll('.deleteBtn');
  deleteBtn.forEach((el) => el.onclick = () => fetch('/delete_item/', {
    method: 'DELETE',
    headers: {'X-CSRFToken': csrftoken},
    body: JSON.stringify({'id': el.parentElement.id.slice(2)})
  })
      .then((item_id) => ids.splice(+el.parentElement.id.slice(2), 1))
      .then(() => el.parentElement.remove()))
}

const editHandler = () => {
  const editBtn = document.querySelectorAll('.editBtn');
  editBtn.forEach((el) => {
    el.onclick = () => {
      const editingEl = document.querySelector('.editing');
        if (editingEl) editingEl.classList.remove('editing');
          input.value = el.parentElement.lastChild.textContent;
          input.setAttribute('class', el.parentElement.id);
          addBtn.setAttribute('disabled', 'disabled');
          addBtn.classList.add('disabled');
          el.parentElement.classList.add('editing');
          saveBtn.removeAttribute('hidden');
          cancelBtn.removeAttribute('hidden');
    }
  })
}

const patchRequest = () => {
  const liEl = document.querySelector(`#${input.className}`);
  console.log(input.className);
  if (checkStringLength()) {
    fetch('/edit_item/', {
      method: 'PATCH',
      headers: {'X-CSRFToken': csrftoken},
      body: JSON.stringify({'id': liEl.id.slice(2), 'content': input.value})
    })
        .then((response) => response.json())
        .then((result) =>  liEl.lastChild.textContent = result.data)
        .then(() => liEl.classList.remove('editing'))
        .then(() => input.value = '')
        .then(() => addBtn.removeAttribute('disabled'))
        .then(() => addBtn.classList.remove('disabled'))
        .then(() => saveBtn.setAttribute('hidden', ''))
        .then(() => cancelBtn.setAttribute('hidden', ''))
  }
}

saveBtn.onclick = patchRequest;

cancelBtn.onclick = () => {
  const liEl = document.querySelector(`#${input.className}`);
  input.value = '';
  addBtn.removeAttribute('disabled');
  addBtn.classList.remove('disabled');
  saveBtn.setAttribute('hidden', '');
  cancelBtn.setAttribute('hidden', '');
  liEl.classList.remove('editing');
}

const completedTasksHandler = () => {
  const editBtn = document.querySelectorAll('.completedBtn');
  editBtn.forEach((el) => el.onclick = () => {
    el.parentElement.classList.toggle('checked');
      if (completed.classList.contains('selected')) {
        filterElements(true);
      } else if (inProgress.classList.contains('selected')) {
        filterElements(false);
      }

      fetch('/completed_item/', {
        method: 'PATCH',
        headers: {'X-CSRFToken': csrftoken},
        body: JSON.stringify({'id': el.parentElement.id.slice(2), 'completed': el.parentElement.classList.contains('checked')})
      })
          .then((response) => response.json())
          .then((result) => console.log(result['result']))
  })
}

const checkStringLength = () => {
  if (input.value.length > 100) {
    input.value = '';
    input.setAttribute('placeholder', 'string length must not be more than 100 symbols');
    return false;
  } else if (input.value.trim().length === 0) return false;
  
  input.setAttribute('placeholder', '');
  return true;
}

const createElement = (content) => {
  if (!ids.includes(content.id) && content.data.trim().length > 0) {
    const li = document.createElement('li');
    li.setAttribute('id', `id${content.id}`);
    li.setAttribute('tabindex', '0');
    const text = document.createTextNode(content.data);
    li.insertAdjacentHTML('beforeend', `<button class="deleteBtn" contenteditable="false">❌</button>
      <button class="completedBtn" id="taskCompleted" contenteditable="false" >✅</button>
      <button class="editBtn" contenteditable="false">Edit</button>`);
    li.append(text);
    if (content.completed) {
      li.className = 'checked';
    }

    if (completed.classList.contains('selected')) {
      li.style.display = 'none';
    } else {
      li.style.display = 'block';
    }

    ids.push(content.id);
    ul.append(li);
    input.value = '';
    console.log(ids);
  }

  deleteHandler();
  completedTasksHandler();
  editHandler();
}

const updateElements = () => {
  const li = document.querySelectorAll('li');
  li.forEach((el) => el.style.display = 'block');
}

const filterElements = (isCompleted) => {
  const li = document.querySelectorAll('li');
  
  li.forEach((el) => {
    if (isCompleted) {
      el.style.display = el.className === 'checked' ? 'block' : 'none';
    } else {
      el.style.display = el.className !== 'checked' ? 'block' : 'none';
    }
  });
}

fetch('/all_items/')
  .then((response) => response.json())
  .then((result) => result.forEach(item => createElement(item)))

add.onclick = () => {
  if (checkStringLength()) {
    fetch('/add/', {
      method: 'POST',
      headers: {'X-CSRFToken': csrftoken},
      body: JSON.stringify({'content': input.value})
    })
      .then((response) => response.json())
      .then((result) => createElement(result))
  }
}

document.addEventListener('keydown', (event) => {
  if (event.code === 'Enter') {
    if (checkStringLength()) {
      if (document.querySelector('.editing')) {
        patchRequest();
      } else {
        fetch('/add/', {
        method: 'POST',
        headers: {'X-CSRFToken': csrftoken},
        body: JSON.stringify({'content': input.value})
        })
          .then((response) => response.json())
          .then((result) => createElement(result))
      }
    }
  }
})

all.onclick = () => {
  updateElements();
  allOptions.classList.add('selected');
  completed.classList.remove('selected');
  inProgress.classList.remove('selected');
}

progress.onclick = () => {
  filterElements(false);
  inProgress.classList.add('selected');
  completed.classList.remove('selected');
  allOptions.classList.remove('selected');

}

completed.onclick = () => {
  filterElements(true);
  completed.classList.add('selected');
  allOptions.classList.remove('selected');
  inProgress.classList.remove('selected');
}

clear.onclick = () => {
  fetch('/clear_completed_tasks/', {
    method: 'DELETE',
    headers: {'X-CSRFToken': csrftoken},
    body: JSON.stringify({'to_delete_all': true})
  })
    .then(() => document.querySelectorAll('.deleteBtn')
    .forEach((el) => {
      if (el.parentElement.classList.contains('checked')) {
        el.parentElement.remove()
      }
    })
    )
}
