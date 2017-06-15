<?php

/**
 *
 */
class SiteDoc
{
  var $source = "README.md.html";

  var $docStartsWith = '<h2>Introduction</h2>';

  function __construct($root) {
    $this->root = $root;
    $this->uri = '#/doc';
    $this->url = './doc/'; // for assets delivery via HTTP(s)
    $this->dir = $this->root . '/doc';
    $this->css = $this->dir . '/style.css';
    $this->source = $this->root . '/' . $this->source;
    $this->minimalTOC = true;

    $opts = array(
      'http'=>array(
        'method'=> "GET",
        'header'=>
          "Accept-language: en\r\n"
         ."Cache-Control: no-cache\r\n"
         ."Pragma: no-cache\r\n"
         ."User-Agent: Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.133 Safari/537.36\r\n"
      )
    );
    $this->stream = stream_context_create($opts);

    if (!$this->resolveDir($this->dir)) exit("Destination directory didn't resolved");

    $this->searchIndex = array();

    $content = $this->fileRead($this->source);
    $this->fileWrite($this->css, $this->extractCSS($content));

    $this->doc = $this->extractDOC($content);

    $this->quoteTags($this->doc);
    $this->wrapTables($this->doc);
    $this->extractImages($this->doc);

    $this->toc = $this->extractTOC();

    $this->pages = $this->splitDOC($this->doc);

    $this->fileWrite($this->dir . '/toc.json', json_encode($this->toc));

    $this->fileWrite($this->dir . '/index.json', json_encode($this->searchIndex));

    foreach ($this->pages as $key => $value) {
      $this->fileWrite($this->dir . '/' . ($key+1) . '.html', $value->description);
    }

  }

  function fileRead ($filename="", $mode="rb") {
    if (empty($filename) || !file_exists($filename)) "";
    if (filesize($filename) == 0) return "";
    if ($file = fopen($filename, $mode)){
      $content = @fread($file, filesize($filename));
      @fclose($file);
      return $content;
    }
    return "";
  }

  function fileWrite ($filename="", $string="", $mode="wb", $chmod=0777) {
    $chmod = ((int)$chmod<=0 || strlen(trim($chmod))<3) ? 0777 : $chmod;
    if(strlen(trim($filename)) == 0) return false;
    if($file = fopen($filename, $mode))
      if(fwrite($file, $string))
        if(fclose($file)) {@chmod($filename, $chmod); return true;}
    return false;
  }

  /**
   * 1. All text is converted to lowercase
   * 2. All non-word text (e.g., punctuation, HTML) is removed
   * 3. All spaces are converted to hyphens
   * 4. Two or more hyphens in a row are converted to one
   * 5. If a header with the same ID has already been generated, a unique
   *    incrementing number is appended, starting at 1.
   */
  function toGithubAnchors ($list=array()) {
    $result = array();
    foreach($list as $key => $title) {
      $anchor = strtolower(trim(strip_tags($title)));
      $anchor = preg_replace('/[^\w\s]/', '', $anchor);
      $anchor = preg_replace('/[\s]+/', '-', $anchor);
      $result[$key] = '#' . $anchor;
    }
    $count = array();
    foreach ($result as $key => $anchor) {
      if (!isset($count[$anchor])) $count[$anchor] = 0;
      else {
        $count[$anchor]++;
        $result[$key] = $anchor . '-' . $count[$anchor];
      }
    }
    return $result;
  }

  function searchContent ($content, $startWith, $endWith) {
    $start = $startWith? strpos($content, $startWith) : 0;
    $end = $endWith ? strpos($content, $endWith) : strlen($content);
    return substr($content, $start, $end - $start);
  }

  function resolveDir ($dir) {
    if (is_dir($dir) || mkdir($dir)) return true;
    else return false;
  }

  function extractCSS ($html) {
    preg_match_all('/<(style)[^>]*>([^\3]+)(<\/\1>)/Ui', $html, $match);
    $result = implode($match[2]);
    $result = preg_replace('/\.markdown-preview\[data\-use\-github\-style\][^}]+}/', '', $result);
    $result = str_replace(':not([data-use-github-style])', '', $result);
    return $result;
  }

  function extractTOC () {
    $html = $this->doc;
    preg_match_all('/<h(\d)[^>]*>([^\3]+)(<\/h\1>)/Ui', $html, $match);
    $map = array();
    $section = 0;
    $skip = true;
    $maxLevel = 0;
    $gitAnchors = $this->toGithubAnchors($match[2]);
    foreach ($match[1] as $key => $value) {
      if ($match[0][$key] == $this->docStartsWith) $skip = false;
      if (!$skip) {
        if ($match[1][$key] == 2) $section++;
        $level = $match[1][$key] - 1;
        if ($level > $maxLevel) $maxLevel = $level;
        $map[] = $this->tocEntry($section, $level, count($map) + 1, $match[2][$key], $gitAnchors[$key]);
      }
    }

    for ($l=$maxLevel; $l>0; $l--) {
      for($i=count($map)-1; $i>=0; $i--) {
        if ($map[$i] && $map[$i]->level != $l) continue;
        for($v=$i; $v>=0; $v--) {
          if ($map[$v] && $map[$i] && $map[$v]->level < $map[$i]->level) {
            $map[$i]->parentId = $v+1;
            array_unshift($map[$v]->children, $map[$i]);
            $map[$i] = null;
            break;
          }
        }
      }
    }
    $result = array();
    foreach($map as $key=>$value) {
      if ($value) $result[] = $value;
    }

    $this->processTOCEntries($result, $html);

    $this->doc = $html;
    return $result;
  }

  function processTOCEntries ($entries, &$html, $path='') {
    foreach ($entries as $key => $entry) {
      $entry->id = $path . ($path ? '.' : '') . ($key + 1);
      $entry->anchor = $this->uri . '/' . $entry->id;
      $html = preg_replace('/(?<=href=("|\'))'.preg_quote($entry->gitAnchor).'(?=("|\'))/Ui', $entry->anchor, $html);
      $id = preg_replace('/^\#/', '', $entry->anchor);
      $html = str_replace('>'.$entry->title.'</h', ' id="'.$id.'">'.$entry->title.'</h', $html);

      if ($this->minimalTOC) {
        unset(
          $entry->level,
          $entry->gitAnchor,
          //$entry->id,
          $entry->parentId
        );
      }
      if (count($entry->children)) {
        $this->{__FUNCTION__}($entry->children, $html, $entry->id);
      }
      else if ($this->minimalTOC) unset($entry->children);

      $content = '';
      if (preg_match('/<(h\d)[^>]*>'.preg_quote($entry->title).'<\/\1>(.*?)<h\d[^>]*>/is', $html, $match) && !empty($match[2])) {
        $content = $match[2];
      }
      $this->addToSearchIndex($entry->id, $entry->anchor, $entry->title, $content);
    }
  }

  function extractDOC ($html) {
    return $this->searchContent($html, $this->docStartsWith, '</body>');
  }

  function splitDOC ($html) {
    $doc = array();
    preg_match_all('/<(h2)[^>]*>([^\3]+)(<\/\1>)/Ui', $html, $match);
    for ($i=0; $i<count($match[0]); $i++) {
      $endWith = isset($match[0][$i+1]) ? $match[0][$i+1] : null;
      $content = $this->searchContent($html, $match[0][$i], $endWith);
      if ($content) $doc[] = $this->docEntry($match[2][$i], $content);
    }
    return $doc;
  }

  function docEntry ($title, $description) {
    $o = new stdClass;
    $o->title = $title;
    $o->description = $description;
    return $o;
  }

  function tocEntry ($section, $level, $id, $title, $gitAnchor=null, $anchor='', $children=array()) {
    $o = new stdClass;
    $o->section = $section;
    $o->level = $level;
    $o->id = $id;
    $o->title = $title;
    $o->anchor = $anchor;
    $o->gitAnchor = $gitAnchor;
    $o->children = $children;
    return $o;
  }

  function extractImages (&$html) {
    $count = 0;
    $html = preg_replace_callback('/(?<=src=("|\'))[^"\']+(?=("|\'))/Ui', function ($match) use (&$count) {
      $count++;
      $filename = $count . '.' . pathinfo($match[0], PATHINFO_EXTENSION);
      $this->fileWrite($this->dir . '/' . $filename, file_get_contents($match[0], false, $this->stream));
      return $this->url . $filename;
    }, $html);
  }

  function quoteTags (&$html) {
   $html = preg_replace_callback(array("/\/\*\[([a-z0-9-_:]+)([^\]]*)\]\*\//i"), function ($m) {
     return str_replace(array('*'), array('&ast;'), $m[0]);
    }, $html);
  }

  function wrapTables (&$html) {
    $html = preg_replace('/(\<table[> ])/Ui', '<div class="table-wrapper">$1', $html);
    $html = str_replace('</table>', '</table></div>', $html);
  }

  function addToSearchIndex ($objectId, $anchor, $title, $content) {
    $content = preg_replace('/<pre(.*?)<\/pre>/is', '... ', $content);
    $o = new stdClass;
    $o->objectID = $objectId;
    $o->anchor = $anchor;
    $o->title = $title;
    $o->content = trim(strip_tags($content));

    $this->searchIndex[] = $o;
  }
}

new SiteDoc(dirname(__FILE__).'/../source');
