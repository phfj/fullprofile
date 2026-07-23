import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server'; //Type-Only Import 
import { requireRole } from '@/lib/auth';
import { Roles } from '@/src/db/schema/auth';

export async function GET(requests: NextRequest) {
    //Restrict access to Admins, Developers, or Staff roles
    const auth = await requireRole([Roles.Admin, Roles.Developer, Roles.Staff]);
    if (!auth.authorized) {
        return auth.response; //returns the 401 or 403 Response automatically
    }

    //You now have access to the verified user: auth.user
    return NextResponse.json({
        success: true,
        message: `Hello, ${auth.user?.firstName}`,
    })
}

/***
 * for import type:
 * 
 * 1. Zero Impact on the Compiled JavaScript Bundle
 * When TypeScript compiles your code into JavaScript, import type statements are completely erased.
 * Since NextRequest was only used as a type annotation ((request: NextRequest)), telling typescript it is only a type ensures no unused JavaScript code in imported or bundles at runtime
 * 
 * 2. Difference Between NextResponse and NextRequest
 * import { NextResponse } (Value Import): NextResponse is excuted at runtime when calling NextResponse.json(..). JavaScript needs this class loaded in memory.
 * import type { NextRequest } (Type Import): NextRequest is never instantiated or called at runtime in that file - it is only used to tell TypeScript what shape the request parameter has.
 * 
 * Using import type:
**  Optimizes build size by stripping away non-runtime dependencies.
**  Prevents accidental side-effects or circular dependencies.
**  Improves developer clarity, explicitly showing that NextRequest is strictly for type-checking.
 */