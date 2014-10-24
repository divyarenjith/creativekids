package com.affinity.vo;

import java.util.ArrayList;
import java.util.List;

public class EndorsementVO {
	
	public String getEndorsementFromId() {
		return endorsementFromId;
	}

	public void setEndorsementFromId(String endorsementFromId) {
		this.endorsementFromId = endorsementFromId;
	}

	public String getEndorsementFromName() {
		return endorsementFromName;
	}

	public void setEndorsementFromName(String endorsementFromName) {
		this.endorsementFromName = endorsementFromName;
	}

	public String getEndorsementForId() {
		return endorsementForId;
	}

	public void setEndorsementForId(String endorsementForId) {
		this.endorsementForId = endorsementForId;
	}

	public String getEndorsementForName() {
		return endorsementForName;
	}

	public void setEndorsementForName(String endorsementForName) {
		this.endorsementForName = endorsementForName;
	}

	public List<String> getTraits() {
		return traits;
	}

	public void setTraits(List<String> traits) {
		this.traits = traits;
	}


	private String endorsementFromId ;
	private String endorsementFromName ;
	
	private String endorsementForId ;
	private String endorsementForName ;
	
	private List<String> traits = new ArrayList<String>() ;
	
	private String hasViewed  ;

	public String getHasViewed() {
		return hasViewed;
	}

	public void setHasViewed(String hasViewed) {
		this.hasViewed = hasViewed;
	}

}
