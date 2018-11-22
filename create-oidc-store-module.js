import { UserManager, WebStorageStateStore } from 'oidc-client'

export default settings => {
  const defaultSettings = {
    userStore: new WebStorageStateStore()
  }

  const oidcUserManager = new UserManager({
    ...defaultSettings,
    ...settings
  })

  oidcUserManager.events.addAccessTokenExpired(async () => {
    await oidcUserManager.signoutRedirect()
  })

  return {
    actions: {
      async check({ getters }, payload) {
        return payload.auth(getters)
      },
      async getUser({ commit }) {
        const user = await oidcUserManager.getUser()

        commit('setUser', { user })
      },
      async signIn({}, payload) {
        const path = payload.redirectPath || document.location.pathname + (document.location.search || '') + (document.location.hash || '')
        sessionStorage.setItem('oidc_redirect_path', path)

        await oidcUserManager.signinRedirect()
      },
      async signInCallback({ commit }) {
        const user = await oidcUserManager.signinRedirectCallback()

        commit('setUser', { user })

        return sessionStorage.getItem('oidc_redirect_path') || '/'
      },
      async signOut() {
        await oidcUserManager.signoutRedirect()
      },
      async signOutCallback({ commit }) {
        await oidcUserManager.signoutRedirectCallback()

        commit('setUser', { user: null })
      }
    },
    getters: {
      accessToken: state => {
        if (state.user == null) {
          return null
        }

        return state.user['access_token']
      },
      hasRole: state => role => {
        if (state.user == null || state.user.profile == null || state.user.profile.roles == null) {
          return false
        }

        if (typeof state.user.profile.roles === 'string') {
          return state.user.profile.roles === role
        }

        if (Array.isArray(state.user.profile.roles)) {
          return state.user.profile.roles.indexOf(role) != -1
        }

        return false
      },
      idToken: state => {
        if (state.user == null) {
          return null
        }

        return state.user['id_token']
      },
      isAuthenticated: state => {
        return state.user != null
      },
      sub: state => {
        if (state.user == null || state.user.profile == null) {
          return null
        }

        return state.user.profile.sub
      },
      user: state => {
        return state.user
      },
      userDisplayName: state => {
        if (state.user == null || state.user.profile == null) {
          return null
        }

        if (state.user.profile['given_name'] != null || state.user.profile['family_name'] != null) {
          return `${state.user.profile['given_name']} ${state.user.profile['family_name']}`
        } else if (state.user.profile.username != null) {
          return state.user.profile.username
        } else {
          return state.user.profile.email
        }
      }
    },
    mutations: {
      setUser(state, payload) {
        state.user = payload.user
      }
    },
    namespaced: true,
    state: {
      user: null
    }
  }
}