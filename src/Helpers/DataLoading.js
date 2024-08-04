import { setUser } from '../store/userSlice';

/**
 * Set up user object
 * @param {Object} authUser - Firebase auth user object
 * @param {Object} dispatch - Redux dispatch
 */
export function userSetUp(authUser, dispatch) {
  const user = {
    email: authUser.email,
    displayName: authUser.displayName,
    emailVerified: authUser.emailVerified,
    createdAt: authUser.metadata.creationTime,
    uid: authUser.uid,
  };
  dispatch(setUser({ ...user }));
}
