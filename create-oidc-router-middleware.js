export default store => {
  return async (to, _from, next) => {
    await store.dispatch('oidc/getUser')

    if (to.meta.auth == null) {
      next()
      return
    }

    const authorized = await store.dispatch('oidc/check', { auth: to.meta.auth })

    if (authorized) {
      next()
    } else if (store.getters['oidc/user'] == null) {
      await store.dispatch('oidc/signIn', { redirectPath: to.path })
    } else {
      next(new Error('Unauthorized'))
    }
  }
}