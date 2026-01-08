// Simulated Firebase/Cloud Auth Service
export interface User {
    uid: string;
    email: string;
    displayName: string;
    photoURL: string;
}

export interface Game {
    id: string;
    date: string;
    opponent: string;
    score: { us: number; them: number };
    status: 'Scanned' | 'Imported';
    tournament?: string;
    stats: any; // Simplified for now
}

class CloudService {
    private currentUser: User | null = null;

    async signInWithGoogle(): Promise<User> {
        // Simulate Google Pop-up
        return new Promise((resolve) => {
            setTimeout(() => {
                this.currentUser = {
                    uid: 'user_' + Math.random().toString(36).substr(2, 9),
                    email: 'coach@example.com',
                    displayName: 'Coach Peterson',
                    photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Coach'
                };
                localStorage.setItem('wp_auth_user', JSON.stringify(this.currentUser));
                resolve(this.currentUser);
            }, 1000);
        });
    }

    getCurrentUser(): User | null {
        if (this.currentUser) return this.currentUser;
        const stored = localStorage.getItem('wp_auth_user');
        if (stored) {
            this.currentUser = JSON.parse(stored);
            return this.currentUser;
        }
        return null;
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('wp_auth_user');
        localStorage.removeItem('wp_user_profile');
    }

    // Tournament / Global Games API (Mock)
    async searchGlobalGames(query: string): Promise<Game[]> {
        const mockGames: Game[] = [
            {
                id: 'g1',
                date: 'Oct 26, 2025',
                opponent: 'Seaside Sharks',
                score: { us: 10, them: 8 },
                status: 'Imported',
                tournament: 'Junior Olympics',
                stats: {}
            },
            {
                id: 'g2',
                date: 'Oct 22, 2025',
                opponent: 'Bay City Bears',
                score: { us: 12, them: 12 },
                status: 'Imported',
                tournament: 'Junior Olympics',
                stats: {}
            }
        ];
        return mockGames.filter(g =>
            g.opponent.toLowerCase().includes(query.toLowerCase()) ||
            g.tournament?.toLowerCase().includes(query.toLowerCase())
        );
    }

    // User's Personal Game Library
    async saveGameToAccount(game: Game) {
        const user = this.getCurrentUser();
        if (!user) return;

        const games = this.getUserGames();
        games.push({ ...game, id: Date.now().toString() });
        localStorage.setItem(`wp_games_${user.uid}`, JSON.stringify(games));
    }

    getUserGames(): Game[] {
        const user = this.getCurrentUser();
        if (!user) return [];
        const stored = localStorage.getItem(`wp_games_${user.uid}`);
        return stored ? JSON.parse(stored) : [];
    }
}

export const Cloud = new CloudService();
