type AllowedVersions = "v1";

export interface Envelope<
  Version extends AllowedVersions,
  Type extends string,
  Data,
> {
  version: Version;
  type: Type;
  data: Data;
}
