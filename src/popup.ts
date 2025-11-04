const msg = document.getElementById('msg')!;
const btn = document.getElementById('btn') as HTMLButtonElement;

btn.addEventListener('click', () => {
  msg.textContent = 'Button clicked!';
});
