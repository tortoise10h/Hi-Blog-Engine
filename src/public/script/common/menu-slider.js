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
console.log('===========> toggler :>', toggler)

for(let i = 0; i < toggler.length; i++) {
  toggler[i].addEventListener('click', function () {
    this.parentElement.querySelector('.directory-nested').classList.toggle('folder-active')
    this.classList.toggle('caret-down')
  })
}
