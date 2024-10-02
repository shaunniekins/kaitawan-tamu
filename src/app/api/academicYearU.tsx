import { supabase } from "@/utils/supabase";

export const fetchAcademicYear = async () => {
  try {
    const response = await supabase.from("AcademicYear").select().single();

    if (response.error) {
      throw response.error;
    }
    return response.data;
  } catch (error) {
    console.error("Error fetching academic year data:", error);
    return null;
  }
};

export const updateAcademicYear = async (
  startingYear: number,
  endingYear: number,
  academicYearId: number
) => {
  try {
    const response = await supabase
      .from("AcademicYear")
      .update({ starting_year: startingYear, ending_year: endingYear })
      .eq("id", academicYearId)
      .select();

    if (response.error) {
      throw response.error;
    }
    return response;
  } catch (error) {
    console.error("Error updating academic year data:", error);
    return null;
  }
};
