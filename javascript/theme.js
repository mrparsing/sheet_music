window.onload = function () {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        console.log("ciao", savedTheme);
        document.body.classList.add('dark-theme');
    }
}