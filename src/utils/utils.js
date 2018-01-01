export const checkAuthForm = (userId, username) => {
  // Check Authen Form
  if (username.trim().length === 0 || userId.trim().length === 0) {
    return ({
      error: true,
      errorMessage: 'User ID and Nickname must be required.'
    })
  }

  var regExp = /[\{\}\[\]\/?.,;:|\)*~`!^\-_+<>@\#$%&\\\=\(\'\"]/gi
  if (regExp.test(username) || regExp.test(userId)) {
    return ({
      error: true,
      errorMessage: 'Please only alphanumeric characters.'
    })
  }

  return ({
    error: null
  })
}
