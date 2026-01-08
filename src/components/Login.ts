import '../style.css';
import { Cloud } from '../services/Cloud';

export interface UserProfile {
  organization: string;
  teamName: string;
  league: string;
}

export const AuthStore = {
  getProfile(): UserProfile | null {
    const data = localStorage.getItem('wp_user_profile');
    return data ? JSON.parse(data) : null;
  },
  saveProfile(profile: UserProfile) {
    localStorage.setItem('wp_user_profile', JSON.stringify(profile));
  },
  logout() {
    Cloud.logout();
    location.reload();
  }
};

export function renderLogin(container: HTMLElement) {
  container.innerHTML = `
    <div class="login-container animate-fade-in" style="display: flex; align-items: center; justify-content: center; min-height: 80vh;">
      <div class="card glass" style="width: 100%; max-width: 450px; padding: 3rem; text-align: center;">
        <div style="font-size: 4rem; margin-bottom: 1rem;">🤽‍♂️</div>
        <h1 style="margin-bottom: 0.5rem; letter-spacing: -1px;">WP STAT TRACKER</h1>
        <p style="color: var(--text-secondary); margin-bottom: 2.5rem;">The professional standard for polo analytics.</p>
        
        <button id="google-login-btn" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 10px; background: white; color: #333; margin-bottom: 2rem;">
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" width="20">
          Sign in with Google
        </button>

        <div style="display: flex; align-items: center; margin-bottom: 2rem; color: var(--text-secondary);">
          <div style="flex: 1; height: 1px; background: rgba(255,255,255,0.1);"></div>
          <span style="padding: 0 1rem; font-size: 0.7rem;">ACCOUNT DETAILS</span>
          <div style="flex: 1; height: 1px; background: rgba(255,255,255,0.1);"></div>
        </div>

        <form id="login-form" style="text-align: left;">
          <div class="form-group">
            <label>Organization / Club</label>
            <input type="text" id="org-name" placeholder="e.g. Pride Water Polo" required>
          </div>
          
          <div class="form-group">
            <label>Specific Team</label>
            <input type="text" id="team-name" placeholder="e.g. 14U Boys Red" required>
          </div>
          
          <div class="form-group">
            <label>League / Conference</label>
            <input type="text" id="league-name" placeholder="e.g. Coastal Zone" required>
          </div>
          
          <button type="submit" style="width: 100%; margin-top: 1.5rem; padding: 1.2rem; font-weight: bold; background: var(--gradient-accent);">
            ENTER DASHBOARD
          </button>
        </form>
        
        <p style="font-size: 0.7rem; color: var(--text-secondary); margin-top: 2rem; opacity: 0.6;">
          Your profile is saved locally to this device for instant access.
        </p>
      </div>
    </div>
  `;

  const form = container.querySelector('#login-form') as HTMLFormElement;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const profile: UserProfile = {
      organization: (container.querySelector('#org-name') as HTMLInputElement).value,
      teamName: (container.querySelector('#team-name') as HTMLInputElement).value,
      league: (container.querySelector('#league-name') as HTMLInputElement).value,
    };

    AuthStore.saveProfile(profile);
    location.reload();
  });

  document.querySelector('#google-login-btn')?.addEventListener('click', async () => {
    const btn = document.querySelector('#google-login-btn') as HTMLButtonElement;
    btn.disabled = true;
    btn.innerHTML = 'Signing in...';

    await Cloud.signInWithGoogle();

    // Check if they also filled out the form, if not use defaults
    const profile: UserProfile = {
      organization: (container.querySelector('#org-name') as HTMLInputElement).value || 'My Club',
      teamName: (container.querySelector('#team-name') as HTMLInputElement).value || 'Varsity',
      league: (container.querySelector('#league-name') as HTMLInputElement).value || 'Unassigned',
    };

    AuthStore.saveProfile(profile);
    location.reload();
  });
}
