import { permissionsList } from "./schemas/fields";
import { ListAccessArgs } from "./types";
// At its simplest, the access control returns a yes or no value depending on the users session

export function isSignedIn({ session }: ListAccessArgs) {
  return !!session;
}

const generatedPermissions = Object.fromEntries(
  permissionsList.map((permission) => [
    permission,
    function ({ session }: ListAccessArgs) {
      return !!session?.data.role?.[permission];
    },
  ])
);

// Permission check if someone meets a criteria - yes or no
export const permissions = {
  //   canManageProducts({ session }) {
  //     return session?.data.role?.canManageProducts;
  //   }, ////-> We use the upper function to not have to do them one by one
  ...generatedPermissions,
  //   isMatias({ session }: ListAccessArgs) {
  //     return session?.data.name.includes('matias');
  //   },
};

// Rule based function
// Rules can return a boolean - Y or N - or a filter which limits which products they can CRUD

export const rules = {
  canManageProducts({ session }: ListAccessArgs) {
    if (!isSignedIn({ session })) return false;
    // 1. Do they have the permission of canManageProducts
    if (permissions.canManageProducts({ session })) return true;
    // 2. If not, do they own this item?
    return { user: { id: session.itemId } };
  },
  canOrder({ session }: ListAccessArgs) {
    if (!isSignedIn({ session })) return false;
    // 1. Do they have the permission of canManageCart
    if (permissions.canManageCart({ session })) return true;
    // 2. If not, do they own this item?
    return { user: { id: session.itemId } };
  },
  canManageOrderItems({ session }: ListAccessArgs) {
    if (!isSignedIn({ session })) return false;
    // 1. Do they have the permission of canManageCart
    if (permissions.canManageCart({ session })) return true;
    // 2. If not, do they own this item?
    return { orders: { user: { id: session.itemId } } };
  },
  canReadProducts({ session }: ListAccessArgs) {
    if (!isSignedIn({ session })) return false;
    if (permissions.canManageProducts({ session })) return true; // They can read everything!
    // They should only see available products(based on status field)
    return { status: "AVAILABLE" };
  },
  canManageUsers({ session }: ListAccessArgs) {
    if (!isSignedIn({ session })) return false;
    // 1. Do they have the permission of canManageCart
    if (permissions.canManageUsers({ session })) return true;
    // 2. Otherwise they may only update themselves
    return { user: { id: session.itemId } };
  },
};
