package com.affinity.persistence;

import java.io.Serializable;

public class UserProfile implements Serializable {

	public String getFacebookId() {
		return facebookId;
	}
	public void setFacebookId(String facebookId) {
		this.facebookId = facebookId;
	}
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	
	private String facebookId ;
	private String name; 
}
