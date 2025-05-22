import { makeRequest } from "@/functions/api/makeRequest";

export async function isServiceEnabledByUser(serviceKey: string): Promise<boolean> {
  try {
    const res = await makeRequest("GET", `/api/uvapi/services/enabled`);
    
    if (res?.status === 200 && Array.isArray(res?.data?.data?.services)) {
      // Check if the service key is in the list of enabled services
      return res.data.data.services.some(
        (svc: { key: string }) => svc.key === serviceKey
      );
    }
    return false;
  } catch (error) {
    console.error(`Error checking service ${serviceKey}`, error);
    return false;
  }
}
