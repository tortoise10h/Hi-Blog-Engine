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
editFileBtns = document.getElementsByClassName('btn-edit-file')
for (let i = 0; i < editFileBtns.length; i++) {
  /** Add listener for all edit buttons to redirect to edit selected file */
  editFileBtns[i].addEventListener('click', () => {
    const markdownFile = editFileBtns[i].value
    console.log(`markdown file: ${markdownFile}`)
    window.location.href = `${DEFAULT_URL}/blog-edit/${markdownFile}`
  })
}
