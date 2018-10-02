export default {
  async created() {
    const path = await this.$store.dispatch('oidc/signInCallback')
    this.$router.push(path)
  }
}