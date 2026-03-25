export const prerender = false;

export async function GET({ cookies }: { cookies: any }) {
  const referral = cookies.get('referral_code')?.value ?? null;

  return new Response(
    JSON.stringify({
      hasReferral: Boolean(referral),
      referralCode: referral,
    }),
    { headers: { 'content-type': 'application/json' } },
  );
}

