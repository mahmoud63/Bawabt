const functions = require('firebase-functions');
const firebase = require('firebase-admin');
const firebaseApp = require('../helper/init');

function getSalemen() {
  const ref = firebaseApp.database().ref('Customer');

  return ref.once('value').then((snap) => snap.val());
}
function removeSalemen(UID) {
  const ref = firebaseApp.database().ref('Customer');

  return ref.child(`${UID}`).remove();
}
function getCustomer(UID) {
  const ref = firebaseApp.database().ref('Customer');

  return ref
    .child(`${UID}`)
    .once('value')
    .then((snap) => snap.val());
}
function editCustomer(body) {}

module.exports = {
  renderCustomers: (req, res) => {
    getSalemen()
      .then((salemen) => {
        return res.render('customers', {
          customers: salemen,
          show: true,
        });
      })
      .catch((err) => res.send(err));
  },

  removeCustomer: (req, res) => {
    removeSalemen(req.params.uid)
      .then(() => {
        return getSalemen()
          .then((salemen) => {
            return res.render('customers', {
              customers: salemen,
              show: true,
            });
          })
          .catch((err) => res.send(err));
      })
      .catch((err) => res.send(err));
  },
  renderCustomer: (req, res) => {
    getCustomer(req.params.uid)
      .then((customer) => res.render('customer', { customer, show: true }))
      .catch((err) => res.send(err));
  },
  editCustomer: (req, res) => {
    const {
      name,
      email,
      phone,
      company,
      password,
      customer,
      customerRegisteredByUID,
    } = req.body;

    let customer_ = customer.toString();

    const ref = firebaseApp.database().ref(`Customer`);
    return ref
      .child(customer_)
      .set({
        customerName: name,
        customerEmail: email,
        customerPhone: phone,
        customerCompany: company,
        customerRegisteredBy: 'admin',
        customerRegisteredByUID: customerRegisteredByUID,
      })
      .then(() => {
        return firebaseApp.auth().updateUser(customer_, { password: password });
      })

      .then(() => {
        return res.redirect('/salemen');
      })
      .catch((err) => res.send(err));
  },
  renderAddCustomer: (req, res) => {
    res.render('customerAdd', { err: 0, show: true });
  },
  addCustomer: async (req, res) => {
    const { name, email, phone, password, company } = req.body;
    return await firebaseApp
      .auth()
      .createUser({
        email: email,
        password: password,
      })
      .then((user) => {
        return firebaseApp
          .database()
          .ref('Customer')
          .child(user['uid'])
          .set({
            customerName: name,
            customerEmail: email,
            customerPhone: phone,
            customerCompany: company,
            customerUID: user['uid'],
            customerRegisteredBy: 'admin',
            customerRegisteredByUID: 'admin',
          })
          .then(() => {
            return res.redirect('/customers');
          })
          .catch((err) => {
            return console.log(err);
          });
      })
      .catch((err) => {
        return getSalemen()
          .then((salemen) => {
            return res.render('customers', {
              customer: salemen,
              err: err,
              show: true,
            });
          })
          .catch((err) => res.send(err));
      });
  },
};
