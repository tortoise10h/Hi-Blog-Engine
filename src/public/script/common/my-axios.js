class MyAxios {
  async fetch ({ url, method, headers, ...options }) {
    try {
      const response = await axios({
        method,
        timeout: TIMEOUT,
        url,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        ...options
      })
      return response
    } catch (error) {
      throw error
    }
  }
}
