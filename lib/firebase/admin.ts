/**
 * =============================================================================
 * ChroniSync
 * Firebase Admin SDK Initialization
 * Server-side only
 * =============================================================================
 */

import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

const app =
  getApps().length > 0
    ? getApps()[0]
    : initializeApp({
        credential: cert({
          projectId: process.env.chronisync-8c5d7,
          clientEmail: process.env.firebase-adminsdk-fbsvc@chronisync-8c5d7.iam.gserviceaccount.com,
          privateKey: process.env."-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCnOTyBOjZUZYbQ\nZQmRn1OuTdFlQQtii0C+uRnCpJLcjQGIK0j5w66CQB8oVS5+6TlQ5G1x+xOfb1YS\nvB82+nCEsKrWFCg32WtCkEsvx6vkhC0odnTndls6FFeSIAR6GsWlKGAmlIuCtJO6\n6IGgCCvyM08HaMZlsLEq7/fhkri5YB//2o7OMYwVmvxvhILvZKZLFcD4nN3dlxiU\nX0Hb9mKDnrcfGXNC2eVR3hmIqTy4d7HOQoTJPYFQkZw2EWDqt1NxOm3aZHEDMxeG\nzCdCb/C1Klb4GatCDxUT8WpUK4VRJ2DMLmT9mi5kOFY2yleLjauOU5C9ftvSdtZa\noiz49js5AgMBAAECggEAIPLdIhVHOS/b9VnDHedHxLNei9XaGWuYsTulgL2OllhO\nMfddZKES1GUv/nFyPN1VRsQLcIbpIeP9EKnyeJG1898fehj0p7R2NuJZfiuYiekl\nQLC+bhDa/sGdU5RtbWWzBczDzTY9mt5bsVs4l0Ck8A7+Bla1qLm83tnzfIW9UgD2\nCnmBR6HqdBWsA05xlQsDy1P0J0F87TdCmMYnSsOGQTlV9O0UaMPU/O2Y6osYCDoF\nIWdKDEROpWZQkymCS3obGtczm3x7VOEpmYR/leb7DKWbk2ctE4oG/25nHPiQqdnY\nimAjFnW0WXnSKoN+2HeTUPK0RfjUuqWLeT3v1l75tQKBgQDZaQffnWeLYYfEZVV9\nBOBnSAsbdYM732Tv8d9AMjwW8fu+gP9kompvhucJ0hKzkYf7m+7GhwzdvwgkyOxl\noF5516WiQ0w3iO7u1QFbzK4XpmBclqOR6S9WsjKKAWjc4lIg53twKUYtD0xHwtQy\ns2QTCisMxOFOci0sw6kfAZDMtwKBgQDE58Hv5YeRSXlBk3ZvVe+zZcZmPxZ1CSfL\nQifS25xrJ7M0SRyCP8OVGeqYNJhtc0LzIVQrnzi6sLPfZh/v3xsVabe3z6I61p78\nzu7VpF/ViUtZ+f/prHlRMlD5wFblhnlfc0lmIx3jBAhkuYOlxFlWr9okmX48FY/c\nPy4BaTwnjwKBgEl5GVQU2d1cxIk2xcFOWJgO3NIW0Jb3VCFS2GPVlkEa3jzvU2Ar\nE1VFfebvu6o70HzTocot8ccuvA3SaTGfFM6QdkV0ANnzyOulyKPBdERB0eb4cabp\n6zmdVz8UYt/jDGZaVHj/OdwYg2rtCNFplrRoh0v1bT8ZjvLF3O3BlbHZAoGAZQm7\nZXs1RmMaWoDtrBG/zyFxXfQPdPy+s7j9sGBKcl3Lwg+mFlvb432J+JI8iSU0/Idk\npoGsXXfgxMilqLOmNSWrRSHBUEnjCTyyJ2SSXIN36/Kx09lR401bady9eke3rjf9\nOPDaHCxslirvl7caVLYlzNQKh5BU4qJ02/qBCJcCgYBuvaqLD/K3oYnKSIGRVSwF\nlQJla6t6xkm8X8/r/tkdWLyrsxMJ3mwr7OOQ+WuHkjrxzGZsg5h0cNKbekSsk0ws\nPt0HH0MfNGQZ8fGirydIdYRy+DVCBvwdtkhaX5SOMFTjwSHDSBZF1rLjtSxlY6MN\nzFUkmjEityYd82uBW1/RTQ==\n-----END PRIVATE KEY-----\n"?.replace(
            /\\n/g,
            "\n"
          ),
        }),
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      });

export const adminAuth = getAuth(app);

export const adminDb = getFirestore(app);

export const adminStorage = getStorage(app);

export default app;