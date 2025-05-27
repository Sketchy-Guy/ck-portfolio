
import { supabase } from '@/integrations/supabase/client';

export const migrateAboutData = async () => {
  try {
    console.log('Starting about data migration...');
    
    // Get the current authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new Error('No authenticated user found. Please log in first.');
    }
    
    console.log('Authenticated user:', user.id);
    
    // Check if data already exists
    const { data: existingData, error: checkError } = await supabase
      .from('about_me')
      .select('*')
      .eq('profile_id', user.id);
    
    if (checkError) {
      throw checkError;
    }
    
    if (existingData && existingData.length > 0) {
      console.log('About data already exists, skipping migration');
      return { success: true, message: 'Data already exists' };
    }
    
    // Define the hardcoded data from About.tsx
    const aboutData = [
      // Education entries
      {
        order: 1,
        type: 'education',
        title: 'Nalanda Institute of Technology',
        subtitle: 'Bachelor of Technology in Computer Science',
        description: 'Currently pursuing B.Tech in Computer Science with focus on software development and AI technologies.',
        period: '2022 - 2026',
        profile_id: user.id
      },
      {
        order: 2,
        type: 'education',
        title: 'Bhadrak Autonomous College',
        subtitle: '+2, Science',
        description: 'Completed higher secondary education with science stream.',
        period: '2020 - 2022',
        profile_id: user.id
      },
      {
        order: 3,
        type: 'education',
        title: 'SSVM Bouth',
        subtitle: '10th, BSE (75%)',
        description: 'Completed matriculation with 75% marks.',
        period: '2020',
        profile_id: user.id
      },
      // Experience entries
      {
        order: 4,
        type: 'experience',
        title: 'Campus Executive Officer',
        subtitle: 'Coding Ninjas 10X Club',
        description: 'Team Leadership and Management\nEvent Organization and Planning',
        period: 'Dec 2024 - Present',
        profile_id: user.id
      },
      {
        order: 5,
        type: 'experience',
        title: 'President',
        subtitle: 'TECHXERA',
        description: 'Led 20+ members organizing 10+ coding workshops\nConducted Python & AI masterclasses for 200+ students',
        period: 'Jun 2024 - Present',
        profile_id: user.id
      }
    ];
    
    // Insert the data
    const { error: insertError } = await supabase
      .from('about_me')
      .insert(aboutData);
    
    if (insertError) {
      throw insertError;
    }
    
    console.log('About data migration completed successfully');
    return { success: true, message: 'Migration completed successfully' };
    
  } catch (error: any) {
    console.error('Error migrating about data:', error);
    return { success: false, message: error.message };
  }
};