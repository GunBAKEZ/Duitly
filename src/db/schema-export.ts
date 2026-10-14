// Re-export skema tanpa menarik koneksi postgres (aman dipakai di skrip tes).
import * as schema from "./schema";
export { schema };
