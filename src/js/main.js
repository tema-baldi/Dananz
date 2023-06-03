const mobileBtn = document.querySelector('.mobile__btn');
const mobileMenu = document.querySelector('.nav__list');

mobileBtn.onclick = () => {
    mobileBtn.classList.toggle('mobile__btn--close')
    mobileMenu.classList.toggle('nav__list--active')
    document.body.classList.toggle('is-menu-open')
}