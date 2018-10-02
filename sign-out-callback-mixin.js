export default {
  async created() {
    await this.$store.dispatch('oidc/signOutCallback')
    this.$router.push('/')
  }
}