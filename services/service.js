class Service {
  constructor ({ web3, mongo }) {
    this.web3 = web3
    this.mongo = mongo
  }
}

module.exports = Service
