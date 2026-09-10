export class RealtimeRoomBuilder {
  static lab(labId: string): string {
    return `lab:${labId}`;
  }

  static doctors(labId: string): string {
    return `lab:${labId}:doctors`;
  }

  static phlebotomists(labId: string): string {
    return `lab:${labId}:phlebotomists`;
  }

  static user(userId: string): string {
    return `user:${userId}`;
  }
}
