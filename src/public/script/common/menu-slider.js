const openNav = () => {
  document.getElementById('mySidenav').style.width = '20em'
  document.getElementById('main').style.marginLeft = '20em'
  // document.body.style.backgroundColor = 'rgba(0,0,0,0.4)'
}

const closeNav = () => {
  document.getElementById('mySidenav').style.width = '0'
  document.getElementById('main').style.marginLeft = '0'
  document.body.style.backgroundColor = 'white'
}

let toggler = document.getElementsByClassName('caret-right')

for (let i = 0; i < toggler.length; i++) {
  toggler[i].addEventListener('click', function() {
    this.parentElement
      .querySelector('.directory-nested')
      .classList.toggle('folder-active')
    this.classList.toggle('caret-down')
  })
}

/** ======== Handle action buttons ======== */
let editFileBtns = document.getElementsByClassName('btn-edit-file')
for (let i = 0; i < editFileBtns.length; i++) {
  /** Add listener for all edit buttons to redirect to edit selected file */
  editFileBtns[i].addEventListener('click', () => {
    const markdownFile = editFileBtns[i].value
    window.location.href = `${DEFAULT_URL}/blogs-edit/${markdownFile}`
  })
}

/** When press delete button on side bar menu */
let deleteFileBtns = document.getElementsByClassName('btn-delete-file')
const confirmDeleteFileBtn = document.getElementById('confirmDeleteFileBtn')

for (let i = 0; i < editFileBtns.length; i++) {
  // press press delete button of each file then assign this btn value (markdown file) to
  // confirm delete button to use to send api
  deleteFileBtns[i].addEventListener('click', () => {
    const markdownFile = deleteFileBtns[i].value
    document.getElementById('confirmDeleteFileBtn').value = markdownFile
  })
}

/** When press confirm delete file */
confirmDeleteFileBtn.addEventListener('click', async () => {
  try {
    const markdownFile = confirmDeleteFileBtn.value

    const myAxios = new MyAxios()
    await myAxios.fetch({
      url: `${DEFAULT_URL}/blogs/${markdownFile}`,
      method: 'DELETE',
      data: {}
    })
    await myAxios.fetch({
      url: `${DEFAULT_URL}/tags/current-tags`,
      method: 'PUT',
      data: {}
    })

    window.location.href = `${DEFAULT_URL}`
  } catch (error) {
    if (error.response) {
      const { data } = error.response
      const { message } = data
      ClientResponse.errorToast('Save file error', message)
    } else {
      console.log('====> error', error)
      ClientResponse.errorToast('Save file error', 'Server error')
    }
  }
})
