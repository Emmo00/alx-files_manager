async function hi() {
  return new Promise((res, rej) => {
    setTimeout(() => {
      res(true)
    }, 4000);
  });
}

hi().then(console.log)