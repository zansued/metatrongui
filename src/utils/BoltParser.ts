export interface ArtifactAction {
  type: 'file' | 'shell';
  filePath?: string;
  content: string;
}

export interface Artifact {
  id: string;
  title: string;
  actions: ArtifactAction[];
}

export class BoltParser {
  public static parse(content: string): Artifact[] {
    const artifacts: Artifact[] = [];
    const artifactRegex = /<boltArtifact\s+id="([^"]+)"\s+title="([^"]+)">([\s\S]*?)(?:<\/boltArtifact>|$)/g;

    let artifactMatch;
    while ((artifactMatch = artifactRegex.exec(content)) !== null) {
      const [, id, title, innerContent] = artifactMatch;
      artifacts.push({ id, title, actions: this.parseActions(innerContent) });
    }
    return artifacts;
  }

  private static parseActions(innerContent: string): ArtifactAction[] {
    const actions: ArtifactAction[] = [];
    const actionRegex = /<boltAction\s+type="([^"]+)"(?:\s+filePath="([^"]*)")?>([\s\S]*?)(?:<\/boltAction>|$)/g;

    let actionMatch;
    while ((actionMatch = actionRegex.exec(innerContent)) !== null) {
      const [, type, filePath, content] = actionMatch;
      if (content.trim()) {
        actions.push({
          type: type as 'file' | 'shell',
          filePath: filePath || undefined,
          content: content.trim()
        });
      }
    }
    return actions;
  }
}
