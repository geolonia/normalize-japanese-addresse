import {
  SingleChiban,
  SingleCity,
  SingleMachiAza,
  SinglePrefecture,
  SingleRsdt,
} from '@geolonia/japanese-addresses-v2'

/**
 * 正規化対象の住所の位置情報
 * 位置情報は EPSG:4326 (WGS84) です。
 */
export type NormalizeResultPoint = {
  /// 緯度
  lat: number
  /// 経度
  lng: number
  /**
   * 緯度経度の正確さを表すレベル
   * - 1 - 都道府県の代表点（県庁所在地）の位置
   * - 2 - 市区町村の代表点（市役所など）の位置
   * - 3 - 丁目・町字の代表点の位置
   * - 8 - 住居表示住所または地番の位置
   */
  level: number
}

export function isNormalizeResultPoint(
  obj: unknown,
): obj is NormalizeResultPoint {
  // Check that obj is an object and not null
  if (typeof obj !== 'object' || obj === null) {
    return false
  }

  // Destructure properties from the object
  const { lat, lng, level } = obj as { [key: string]: unknown }

  // Check that lat, lng, and level are numbers
  if (
    typeof lat !== 'number' ||
    typeof lng !== 'number' ||
    typeof level !== 'number'
  ) {
    return false
  }

  // Optionally, validate that level is one of the expected values
  const validLevels = [1, 2, 3, 8]
  if (!validLevels.includes(level)) {
    return false
  }

  // All checks passed
  return true
}

export function prefectureToResultPoint(
  pref: SinglePrefecture,
): NormalizeResultPoint {
  return {
    lat: pref.point[1],
    lng: pref.point[0],
    level: 1,
  }
}

export function cityToResultPoint(city: SingleCity): NormalizeResultPoint {
  return {
    lat: city.point[1],
    lng: city.point[0],
    level: 2,
  }
}

export function machiAzaToResultPoint(
  machiAza: SingleMachiAza,
): NormalizeResultPoint | undefined {
  if (!machiAza.point) return undefined
  return {
    lat: machiAza.point[1],
    lng: machiAza.point[0],
    level: 3,
  }
}

export function rsdtOrChibanToResultPoint(
  input: SingleRsdt | SingleChiban,
): NormalizeResultPoint | undefined {
  if (!input.point) return undefined
  return {
    lat: input.point[1],
    lng: input.point[0],
    level: 8,
  }
}

export function upgradePoint(
  a: NormalizeResultPoint | undefined,
  b: NormalizeResultPoint | undefined,
): NormalizeResultPoint | undefined {
  if (!a) return b
  if (!b) return a
  if (a.level > b.level) return a
  return b
}

export type NormalizeResultMetadata = {
  input: string

  /** 都道府県 */
  prefecture?: SinglePrefecture
  /** 市区町村 */
  city?: SingleCity
  /** 町字 */
  machiAza?: SingleMachiAza
  /** 丁目 */
  chiban?: SingleChiban
  /** 住居表示住所 */
  rsdt?: SingleRsdt
}

export type NormalizeResult = {
  /** 都道府県 */
  pref?: string
  /** 市区町村 */
  city?: string
  /**
   * 丁目・町字
   * 丁目の場合は、丁目名の後に漢数字で丁目が付与される。
   * 例：「青葉一丁目」
   */
  town?: string
  /** 住居表示または地番 */
  addr?: string
  /** 正規化後の住所文字列。完全に正規化された場合は、空の文字列が入ります。 */
  other: string

  /**
   * 住所の緯度経度
   * 注意: 正規化レベルが8でも、位置情報は8でもない場合もあります。
   */
  point?: NormalizeResultPoint

  /**
   * 住所文字列をどこまで判別できたかを表す正規化レベル
   * - 0 - 都道府県も判別できなかった。
   * - 1 - 都道府県まで判別できた。
   * - 2 - 市区町村まで判別できた。
   * - 3 - 丁目・町字まで判別できた。
   * - 8 - 住居表示住所または地番の判別ができた。
   */
  level: number

  /** 追加情報 */
  metadata: NormalizeResultMetadata
}
