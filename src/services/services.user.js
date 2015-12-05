/**
 * Creates a user.
 * @param {Object} account
 * @param {Object} options
 */
function user_create(account, options) {
  try {
    services_resource_defaults(options, 'user', 'create');
    entity_create('user', null, account, options);
  }
  catch (error) { console.log('user_create - ' + error); }
}

/**
 * Retrieves a user.
 * @param {Number} ids
 * @param {Object} options
 */
function user_retrieve(ids, options) {
  try {
    services_resource_defaults(options, 'user', 'retrieve');
    entity_retrieve('user', ids, options);
  }
  catch (error) { console.log('user_retrieve - ' + error); }
}

/**
 * Updates a user.
 * @param {Object} account
 * @param {Object} options
 */
function user_update(account, options) {
  try {
    var mode = 'create';
    if (account.uid) { mode = 'update'; }
    services_resource_defaults(options, 'user', mode);
    entity_update('user', null, account, options);
  }
  catch (error) { console.log('user_update - ' + error); }
}

/**
 * Delete a user.
 * @param {Number} uid
 * @param {Object} options
 */
function user_delete(uid, options) {
  try {
    services_resource_defaults(options, 'user', 'create');
    entity_delete('user', uid, options);
  }
  catch (error) { console.log('user_delete - ' + error); }
}

/**
 * Perform a user index.
 * @param {Object} query
 * @param {Object} options
 */
function user_index(query, options) {
  try {
    services_resource_defaults(options, 'user', 'create');
    entity_index('user', query, options);
  }
  catch (error) { console.log('user_index - ' + error); }
}

/**
 * Registers a user.
 * @param {Object} account
 * @param {Object} options
 */
function user_register(account, options) {
  try {
    jDrupal.services.call({
        service: 'user',
        resource: 'register',
        method: 'POST',
        path: 'user/register',
        data: JSON.stringify(account),
        success: function(data) {
          try {
            if (options.success) { options.success(data); }
          }
          catch (error) { console.log('user_register - success - ' + error); }
        },
        error: function(xhr, status, message) {
          try {
            if (options.error) { options.error(xhr, status, message); }
          }
          catch (error) { console.log('user_register - error - ' + error); }
        }
    });
  }
  catch (error) { console.log('user_retrieve - ' + error); }
}

/**
 * Login user.
 * @param {String} name
 * @param {String} pass
 * @param {Object} options
 */
function jDrupalUserLogin(name, pass, options) {
  try {
    var valid = true;
    if (!name || typeof name !== 'string') {
      valid = false;
      console.log('jDrupalUserLogin - invalid name');
    }
    if (!pass || typeof pass !== 'string') {
      valid = false;
      console.log('jDrupalUserLogin - invalid pass');
    }
    if (!valid) {
      if (options.error) { options.error(null, 406, 'jDrupalUserLogin - bad input'); }
      return;
    }
    jDrupal.services.call({
        service: 'user',
        resource: 'login',
        method: 'POST',
        path: 'user/login',
        data: 'name=' + encodeURIComponent(name) +
          '&pass=' + encodeURIComponent(pass) +
          '&form_id=user_login_form',
        success: function(account) {
          try {

            // Since Drupal only returns a 200 OK to us, we don't have much
            // opportunity to make a decision here yet. So let's do a connect
            // call to get the current user id, then load the user's account.

            jDrupalConnect({
              success: function(connect) {
                console.log(connect);
                if (options.success) { options.success(connect); }
              },
              error: function(xhr, status, message) {
                console.log('jDrupalUserLogin -> jDrupalConnect | error');
                console.log(arguments);
              }
            });

            return;
            // Now that we are logged in, we need to get a new CSRF token.
            jDrupal.user = new jDrupal.Entity.User(account);
            jDrupal.sessid = null;
            services_get_csrf_token({
                success: function(token) {
                  try {
                    if (options.success) { options.success(account); }
                  }
                  catch (error) {
                    console.log(
                      'user_login - services_get_csrf_token - success - ' +
                      error
                    );
                  }
                },
                error: function(xhr, status, message) {
                  console.log(
                    'user_login - services_get_csrf_token - error - ' +
                    message
                  );
                  if (options.error) { options.error(xhr, status, message); }
                }
            });
          }
          catch (error) { console.log('jDrupalUserLogin - success - ' + error); }
        },
        error: function(xhr, status, message) {
          try {
            if (options.error) { options.error(xhr, status, message); }
          }
          catch (error) { console.log('jDrupalUserLogin - error - ' + error); }
        }
    });
  }
  catch (error) {
    console.log('jDrupalUserLogin - ' + error);
  }
}

/**
 * Logout current user.
 * @param {Object} options
 */
function user_logout(options) {
  try {
    jDrupal.services.call({
        service: 'user',
        resource: 'logout',
        method: 'GET',
        path: 'user/logout',
        Accept: 'text/html',
        success: function(data) {
          try {
            // Now that we logged out, clear the user and sessid, then make a
            // fresh connection.
            jDrupal.user = new jDrupal.Entity.User(drupal_user_defaults());
            jDrupal.sessid = null;
            jDrupal_connect({
                success: function(result) {
                  try {
                    if (options.success) { options.success(data); }
                  }
                  catch (error) {
                    console.log(
                      'user_logout - jDrupal_connect - success - ' +
                      error
                    );
                  }
                },
                error: function(xhr, status, message) {
                  try {
                    if (options.error) { options.error(xhr, status, message); }
                  }
                  catch (error) {
                    console.log(
                      'user_logout - jDrupal_connect - error - ' +
                      error
                    );
                  }
                }
            });
          }
          catch (error) { console.log('user_logout - success - ' + error); }
        },
        error: function(xhr, status, message) {
          try {
            if (options.error) { options.error(xhr, status, message); }
          }
          catch (error) { console.log('user_logout - error - ' + error); }
        }
    });
  }
  catch (error) {
    console.log('user_logout - ' + error);
  }
}

